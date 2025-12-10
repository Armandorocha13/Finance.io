#!/bin/bash
# ============================================================================
# Script de Conexão Bash - Supabase PostgreSQL
# ============================================================================
# 
# Este script conecta ao banco de dados Supabase usando psql
# 
# Uso: ./connect.sh
# 
# @author Vaidoso FC
# @version 1.0.0
# ============================================================================

CONNECTION_STRING="postgresql://postgres:UqXAaQWafg8Guokw@db.zmowanlowqpioxbycead.supabase.co:5432/postgres"

echo "========================================"
echo "  Conectando ao Supabase PostgreSQL"
echo "========================================"
echo ""
echo "Host: db.zmowanlowqpioxbycead.supabase.co"
echo "Database: postgres"
echo "User: postgres"
echo ""
echo "Conectando..."
echo ""

# Verifica se psql está instalado
if ! command -v psql &> /dev/null; then
    echo "ERRO: psql não encontrado!"
    echo ""
    echo "Instale o PostgreSQL para usar psql:"
    echo "  sudo apt-get install postgresql-client  # Ubuntu/Debian"
    echo "  brew install postgresql                 # macOS"
    echo ""
    echo "Ou use o Supabase Dashboard:"
    echo "  https://zmowanlowqpioxbycead.supabase.co"
    exit 1
fi

# Conecta ao banco
psql "$CONNECTION_STRING"

