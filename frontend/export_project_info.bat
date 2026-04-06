@echo off
setlocal enabledelayedexpansion

REM Archivo de salida
set "OUTFILE=%~dp0project_info.md"
set "ROOT=%~dp0"

REM Cabecera
>"%OUTFILE%" (
    echo # Estructura del proyecto
    echo.
    echo Generated on %DATE% %TIME%
    echo.
    echo ## Resumen de archivos por carpeta principal
    echo.
    echo Ruta raíz: %ROOT%
    echo.
    echo (Se excluyen carpetas de librerías instaladas: node_modules, .git, .vscode)
    echo.
)

REM Procesar cada carpeta principal en la raíz
for /f "delims=" %%D in ('dir /b /a:d "%ROOT%" 2^>nul') do (
    if /i not "%%D"=="node_modules" if /i not "%%D"==".git" if /i not "%%D"==".vscode" (
        call :PrintFolder "%%D"
    )
)

echo Informe generado en "%OUTFILE%"
endlocal
goto :EOF

:PrintFolder
set "FOLDER=%~1"
set "FOLDERPATH=%ROOT%%FOLDER%\"

echo ## Carpeta principal: %FOLDER% >> "%OUTFILE%"
echo Ruta: %FOLDERPATH% >> "%OUTFILE%"
echo. >> "%OUTFILE%"

echo + %FOLDER% >> "%OUTFILE%"
call :Tree "%FOLDERPATH%" 1

echo. >> "%OUTFILE%"
goto :EOF

:Tree
setlocal enabledelayedexpansion
set "CUR=%~1"
set "LEVEL=%~2"
set "INDENT="
for /l %%I in (1,1,%LEVEL%) do set "INDENT=!INDENT!    "

for /f "delims=" %%E in ('dir /b /a:d "%CUR%" 2^>nul') do (
    if /i not "%%E"=="node_modules" if /i not "%%E"==".git" if /i not "%%E"==".vscode" (
        echo !INDENT!+ %%E >> "%OUTFILE%"
        if %LEVEL% lss 2 call :Tree "%CUR%%%E\" !LEVEL!+1
    )
)
for /f "delims=" %%F in ('dir /b /a:-d "%CUR%" 2^>nul') do (
    echo !INDENT!  - %%F >> "%OUTFILE%"
)
endlocal
goto :EOF