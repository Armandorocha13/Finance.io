# ============================================================================
# Script de Conexão PowerShell - Supabase PostgreSQL
# ============================================================================
# 
# Este script conecta ao banco de dados Supabase usando psql
# 
# Uso: .\connect.ps1
# 
# @author Vaidoso FC
# @version 1.0.0
# ============================================================================

$connectionString = "postgresql://postgres:UqXAaQWafg8Guokw@db.zmowanlowqpioxbycead.supabase.co:5432/postgres"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Conectando ao Supabase PostgreSQL" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Host: db.zmowanlowqpioxbycead.supabase.co" -ForegroundColor Yellow
Write-Host "Database: postgres" -ForegroundColor Yellow
Write-Host "User: postgres" -ForegroundColor Yellow
Write-Host ""
Write-Host "Conectando..." -ForegroundColor Green
Write-Host ""

# Verifica se psql está instalado
$psqlPath = Get-Command psql -ErrorAction SilentlyContinue

if (-not $psqlPath) {
    Write-Host "ERRO: psql não encontrado!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Instale o PostgreSQL para usar psql:" -ForegroundColor Yellow
    Write-Host "  https://www.postgresql.org/download/" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Ou use o Supabase Dashboard:" -ForegroundColor Yellow
    Write-Host "  https://zmowanlowqpioxbycead.supabase.co" -ForegroundColor Yellow
    exit 1
}

# Conecta ao banco
& psql $connectionString

