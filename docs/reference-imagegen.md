# 参考 GitHub 项目的复现方法

参考项目：

<https://github.com/Xiazhixuan119748/hatch-pet-and-imagegen->

## 目标

只安装参考项目中的 `ImageGen`，不安装 `Hatch Pet`。聊天继续使用原来的文字模型，图片生成通过单独的第三方图片 Provider 完成。

## 准备

- Codex Desktop
- Windows PowerShell
- Python 3.10+
- Git，或通过 GitHub 的 `Code -> Download ZIP` 下载参考项目
- 一个具有图片生成权限的第三方 API Key

API Key 只保存在本机，不要放进代码、截图、Issue 或 GitHub 提交记录。

## 下载参考项目

```powershell
git clone https://github.com/Xiazhixuan119748/hatch-pet-and-imagegen-.git
Set-Location hatch-pet-and-imagegen-
```

如果没有 Git，可以在参考项目页面下载 ZIP 并解压。

## 备份官方 ImageGen

完全退出 Codex Desktop 后执行：

```powershell
$CodexHome = Join-Path $env:USERPROFILE '.codex'
$SkillHome = Join-Path $CodexHome 'skills'
$BackupRoot = Join-Path $CodexHome ("skill-backups\before-third-party-imagegen-" + (Get-Date -Format 'yyyyMMdd-HHmmss'))

New-Item -ItemType Directory -Force -Path $BackupRoot | Out-Null

$OfficialImagegen = Join-Path $SkillHome '.system\imagegen'
if (Test-Path $OfficialImagegen) {
    Copy-Item $OfficialImagegen (Join-Path $BackupRoot 'imagegen') -Recurse -Force
}

Write-Host "Official ImageGen backup: $BackupRoot"
```

请保存输出的备份路径，恢复时需要用到。

## 只安装 ImageGen

将 `$ProjectRoot` 改成参考项目的实际解压目录：

```powershell
$ProjectRoot = 'C:\path\to\hatch-pet-and-imagegen-'
$CodexHome = Join-Path $env:USERPROFILE '.codex'
$SkillHome = Join-Path $CodexHome 'skills'

New-Item -ItemType Directory -Force -Path (Join-Path $SkillHome '.system') | Out-Null
Copy-Item (Join-Path $ProjectRoot '.system\imagegen') `
  (Join-Path $SkillHome '.system') -Recurse -Force
```

不要复制参考项目中的 `hatch-pet` 文件夹，因为本项目只使用图片生成能力。

## 安装依赖

```powershell
py -m pip install --upgrade openai httpx pillow
```

如果系统没有 `py` 命令：

```powershell
python -m pip install --upgrade openai httpx pillow
```

## 配置第三方 Provider

复制配置模板到 Codex 用户目录：

```powershell
$CodexHome = Join-Path $env:USERPROFILE '.codex'
Copy-Item '.\imagegen.env' (Join-Path $CodexHome 'imagegen.env') -Force
notepad (Join-Path $CodexHome 'imagegen.env')
```

OpenAI-compatible Provider 的通用格式：

```dotenv
IMAGE_PROVIDER=openai
OPENAI_API_KEY=replace_me
OPENAI_BASE_URL=https://your-provider.example/v1
OPENAI_IMAGE_MODEL=gpt-image-2
```

注意：`OPENAI_BASE_URL` 填供应商的基础地址，具体是否需要 `/v1` 以供应商文档为准；不要把 `/images/generations` 重复写进基础地址后再让脚本重复拼接。

## 验证配置

```powershell
$Imagegen = Join-Path $env:USERPROFILE '.codex\skills\.system\imagegen\scripts\image_gen_with_codex_env.py'
py $Imagegen generate `
  --prompt 'configuration test' `
  --dry-run `
  --out "$env:TEMP\imagegen-dry-run.png"
```

`dry-run` 只检查配置和请求结构，不发送生成请求，也不会生成图片。

## 在 Codex 对话中调用

重启 Codex Desktop 后，可以输入：

```text
$imagegen 生成一张黑白日式漫画：雨夜车站，一个短黑发少女站在站台中央，电影感构图，湿地反光，墨线和网点阴影，无对白框，无水印。
```

也可以在 PowerShell 中直接调用：

```powershell
py $Imagegen generate `
  --prompt 'A finished black-and-white manga illustration of a rainy train station at night, cinematic composition, wet reflections, ink fills and screentone shading, no speech bubbles, no watermark.' `
  --size '1024x1024' `
  --quality 'high' `
  --out "$env:USERPROFILE\Desktop\rainy-station-girl.png"
```

## 更换供应商

只需要修改本机的：

```text
C:\Users\你的用户名\.codex\imagegen.env
```

通常修改这三项：

```dotenv
OPENAI_API_KEY=new-key
OPENAI_BASE_URL=https://new-provider.example/v1
OPENAI_IMAGE_MODEL=new-image-model
```

Codex 的聊天模型配置不需要跟着更改。

## 恢复官方 ImageGen

退出 Codex Desktop，将备份目录中的 `imagegen` 复制回：

```text
C:\Users\你的用户名\.codex\skills\.system\imagegen
```

恢复后重新启动 Codex Desktop，并确认官方 ImageGen 正常工作。

## 常见错误

- `401`：Key 无效、过期或没有图片权限。
- `404`：基础地址、接口路径或模型名不匹配。
- `429`：供应商限流，降低频率后再试。
- `502`：上游网关暂时不可用，检查供应商状态。

失败请求不要连续重复提交，以免产生重复计费。
