# MCP Unity WebSocket Server 启动脚本
# 用于连接到 Unity Editor (Myproject)

Write-Host "🚀 启动 MCP Unity WebSocket 服务器..." -ForegroundColor Green
Write-Host ""

# 检查 build/index.js 是否存在
if (-not (Test-Path ".\build\index.js")) {
    Write-Host "❌ 错误: build/index.js 不存在！" -ForegroundColor Red
    Write-Host "   请先运行: npm run build" -ForegroundColor Yellow
    Write-Host ""
    pause
    exit 1
}

# 检查 Node.js 是否安装
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js 版本: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ 错误: 未找到 Node.js！" -ForegroundColor Red
    Write-Host "   请安装 Node.js: https://nodejs.org/" -ForegroundColor Yellow
    Write-Host ""
    pause
    exit 1
}

Write-Host ""

# 设置环境变量
$env:UNITY_PORT = "8090"
$env:MCP_TRANSPORT = "websocket"
$env:MCP_WS_PORT = "3001"
$env:MCP_WS_HOST = "0.0.0.0"
$env:LOG_LEVEL = "INFO"

Write-Host "📋 配置信息:" -ForegroundColor Cyan
Write-Host "  Unity Bridge 端口: $env:UNITY_PORT" -ForegroundColor Yellow
Write-Host "  MCP WebSocket 端口: $env:MCP_WS_PORT" -ForegroundColor Yellow
Write-Host "  MCP WebSocket 主机: $env:MCP_WS_HOST" -ForegroundColor Yellow
Write-Host "  日志级别: $env:LOG_LEVEL" -ForegroundColor Yellow
Write-Host ""

Write-Host "⚠️  请确保:" -ForegroundColor Magenta
Write-Host "  1. Unity Editor (Myproject) 已经打开" -ForegroundColor White
Write-Host "  2. Unity Bridge 服务器已启动 (Tools > MCP Unity > Server Window)" -ForegroundColor White
Write-Host "  3. Unity Bridge 状态显示为 '服务器在线' (绿色)" -ForegroundColor White
Write-Host ""

Write-Host "🔌 正在连接到 Unity Bridge (ws://localhost:8090)..." -ForegroundColor Green
Write-Host "🌐 MCP WebSocket 服务器将监听 0.0.0.0:3001" -ForegroundColor Green
Write-Host ""
Write-Host "按 Ctrl+C 停止服务器" -ForegroundColor Gray
Write-Host "========================================" -ForegroundColor Gray
Write-Host ""

# 启动服务器
node .\build\index.js

# 如果服务器退出，显示错误信息
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "❌ 服务器启动失败！退出代码: $LASTEXITCODE" -ForegroundColor Red
    Write-Host ""
    Write-Host "常见问题:" -ForegroundColor Yellow
    Write-Host "  1. 端口 $env:MCP_WS_PORT 已被占用" -ForegroundColor White
    Write-Host "  2. Unity Bridge 未启动或端口 $env:UNITY_PORT 不可用" -ForegroundColor White
    Write-Host "  3. 缺少依赖包 (运行 npm install)" -ForegroundColor White
    Write-Host ""
    pause
}

