# 批量修复C#工具文件的数组格式支持

$filesToFix = @(
    "Camera\CreateCameraTool.cs",
    "Camera\CreateCinemachineVirtualCameraTool.cs",
    "GameObject\CreateEmptyGameObjectTool.cs",
    "GameObject\CreatePrimitiveObjectTool.cs",
    "Lighting\CreateLightTool.cs",
    "Lighting\CreateReflectionProbeTool.cs",
    "Material\CreateSkyboxTool.cs",
    "Terrain\CreateInfiniteMountainTool.cs",
    "UI\CreateGridLayoutGroupTool.cs",
    "UI\CreateProBuilderShapeTool.cs",
    "UI\CreateUIButtonTool.cs",
    "UI\CreateUIDropdownTool.cs",
    "UI\CreateUIImageTool.cs",
    "UI\CreateUIInputFieldTool.cs",
    "UI\CreateUIPanelTool.cs",
    "UI\CreateUIScrollViewTool.cs",
    "UI\CreateUITextTool.cs",
    "UI\CreateUIToggleTool.cs",
    "VFX\CreateParticleSystemTool.cs",
    "VFX\CreateWindZoneTool.cs"
)

$basePath = "..\Editor\Tools"
$fixedCount = 0

foreach ($file in $filesToFix) {
    $fullPath = Join-Path $basePath $file
    
    if (-not (Test-Path $fullPath)) {
        Write-Host "⚠️  File not found: $file" -ForegroundColor Yellow
        continue
    }
    
    $content = Get-Content $fullPath -Raw
    $originalContent = $content
    
    # 检查是否已经有数组格式支持
    if ($content -match 'parameters\["position"\].*JTokenType\.Array') {
        Write-Host "⏭️  Already fixed: $file" -ForegroundColor Gray
        continue
    }
    
    # 修复位置参数 (posX/posY/posZ -> position array)
    if ($content -match 'parameters\["posX"\]') {
        $positionCode = @"
                
                // ✅ 支持两种位置格式
                float posX = 0f, posY = 0f, posZ = 0f;
                if (parameters["position"] != null && parameters["position"].Type == JTokenType.Array)
                {
                    // 数组格式: position: [x, y, z]
                    var pos = parameters["position"].ToObject<float[]>();
                    if (pos.Length >= 3)
                    {
                        posX = pos[0];
                        posY = pos[1];
                        posZ = pos[2];
                    }
                }
                else
                {
                    // 分离格式: posX, posY, posZ
                    posX = parameters["posX"]?.ToObject<float>() ?? 0f;
                    posY = parameters["posY"]?.ToObject<float>() ?? 0f;
                    posZ = parameters["posZ"]?.ToObject<float>() ?? 0f;
                }
"@
        
        # 替换旧的位置参数解析
        $content = $content -replace '(?s)(\s+float posX = parameters\["posX"\].*?\r?\n\s+float posY = parameters\["posY"\].*?\r?\n\s+float posZ = parameters\["posZ"\].*?\r?\n)', $positionCode
    }
    
    # 修复颜色参数 (string -> RGBA array)
    if ($content -match 'parameters\["color"\].*ToObject<string>') {
        $colorCode = @"

                // ✅ 支持两种颜色格式
                Color color = Color.white;
                if (parameters["color"] != null)
                {
                    var colorToken = parameters["color"];
                    if (colorToken.Type == JTokenType.Array)
                    {
                        // 数组格式: color: [r, g, b, a] (0-1 范围)
                        var rgba = colorToken.ToObject<float[]>();
                        if (rgba.Length >= 3)
                        {
                            color = new Color(
                                rgba[0], 
                                rgba[1], 
                                rgba[2], 
                                rgba.Length > 3 ? rgba[3] : 1f
                            );
                        }
                    }
                    else if (colorToken.Type == JTokenType.String)
                    {
                        // 字符串格式: color: "#FF0000"
                        string colorHex = colorToken.ToObject<string>();
                        if (!ColorUtility.TryParseHtmlString(colorHex, out color))
                        {
                            color = Color.white;
                        }
                    }
                }
"@
        
        # 替换旧的颜色参数解析
        $content = $content -replace '(?s)(\s+string colorHex = parameters\["color"\].*?ColorUtility\.TryParseHtmlString.*?\r?\n)', $colorCode
    }
    
    if ($content -ne $originalContent) {
        Set-Content -Path $fullPath -Value $content -NoNewline
        Write-Host "✅ Fixed: $file" -ForegroundColor Green
        $fixedCount++
    } else {
        Write-Host "⏭️  No changes: $file" -ForegroundColor Gray
    }
}

Write-Host "`n✨ Fixed $fixedCount C# files" -ForegroundColor Cyan

