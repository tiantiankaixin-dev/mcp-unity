$file = "Server~\src\tools\meta\GetToolNamesTool.ts"
$content = Get-Content $file -Raw -Encoding UTF8
$content = $content -replace '🚨 ABSOLUTE: 1\) PLAN tool sequence, 2\) EXECUTE with discover_and_use_batch \(2\+ tools\)\. Chain: \$\.\{index\}\.field', '📋 STEP 2/4: Review tools → STEP 3: discover_and_use_batch (2+ tools, chain with $.{index}.field)'
$content = $content -replace 'Return tool names \(and parameter schemas\) for a given category\. Mirrors unity://tool-names/\{category\}\.', '📋 STEP 2: Get tool names and schemas for a category. Use after list_categories.'
Set-Content $file -Value $content -NoNewline -Encoding UTF8
Write-Host "Updated GetToolNamesTool.ts"

