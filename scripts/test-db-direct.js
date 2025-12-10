/**
 * Teste Direto de Conexão PostgreSQL - Supabase
 * 
 * Este script testa a conexão direta com o banco PostgreSQL
 * usando a string de conexão fornecida.
 * 
 * Execute: npm run test:db:direct
 * 
 * @author Vaidoso FC
 */

import pg from 'pg';
const { Client } = pg;

const connectionString = 'postgresql://postgres:UqXAaQWafg8Guokw@db.zmowanlowqpioxbycead.supabase.co:5432/postgres';

console.log('\n🔌 Testando conexão direta com PostgreSQL...\n');
console.log('Host: db.zmowanlowqpioxbycead.supabase.co');
console.log('Database: postgres\n');

const client = new Client({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

async function testConnection() {
  try {
    // Conecta ao banco
    console.log('1️⃣ Conectando ao banco de dados...');
    await client.connect();
    console.log('   ✅ Conexão estabelecida!\n');
    
    // Teste 1: Verificar versão do PostgreSQL
    console.log('2️⃣ Verificando versão do PostgreSQL...');
    const versionResult = await client.query('SELECT version()');
    console.log(`   ✅ ${versionResult.rows[0].version.split(',')[0]}\n`);
    
    // Teste 2: Verificar se as tabelas existem
    console.log('3️⃣ Verificando tabelas...');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('categories', 'transactions', 'artilharia')
      ORDER BY table_name;
    `);
    
    const existingTables = tablesResult.rows.map(row => row.table_name);
    const expectedTables = ['artilharia', 'categories', 'transactions'];
    
    for (const table of expectedTables) {
      if (existingTables.includes(table)) {
        console.log(`   ✅ ${table} - Existe`);
      } else {
        console.log(`   ❌ ${table} - Não encontrada`);
      }
    }
    
    if (existingTables.length === 0) {
      console.log('\n   ⚠️  Nenhuma tabela encontrada.');
      console.log('   Execute: supabase/migrations/001_initial_schema.sql\n');
    } else {
      console.log(`\n   📊 Total: ${existingTables.length}/3 tabelas criadas\n`);
    }
    
    // Teste 3: Verificar RLS
    console.log('4️⃣ Verificando Row Level Security (RLS)...');
    const rlsResult = await client.query(`
      SELECT tablename, rowsecurity 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename IN ('categories', 'transactions', 'artilharia')
      ORDER BY tablename;
    `);
    
    if (rlsResult.rows.length > 0) {
      for (const row of rlsResult.rows) {
        const status = row.rowsecurity ? '✅ Habilitado' : '❌ Desabilitado';
        console.log(`   ${status} - ${row.tablename}`);
      }
    } else {
      console.log('   ⚠️  Nenhuma tabela encontrada para verificar RLS');
    }
    console.log('');
    
    // Teste 4: Verificar policies
    console.log('5️⃣ Verificando políticas de segurança...');
    const policiesResult = await client.query(`
      SELECT tablename, COUNT(*) as policy_count
      FROM pg_policies
      WHERE schemaname = 'public'
      AND tablename IN ('categories', 'transactions', 'artilharia')
      GROUP BY tablename
      ORDER BY tablename;
    `);
    
    if (policiesResult.rows.length > 0) {
      for (const row of policiesResult.rows) {
        console.log(`   ✅ ${row.tablename} - ${row.policy_count} policies`);
      }
      const totalPolicies = policiesResult.rows.reduce((sum, row) => sum + parseInt(row.policy_count), 0);
      console.log(`\n   📊 Total: ${totalPolicies} policies criadas`);
    } else {
      console.log('   ⚠️  Nenhuma policy encontrada');
      console.log('   Execute: supabase/migrations/001_initial_schema.sql');
    }
    console.log('');
    
    // Teste 5: Contar registros (se tabelas existirem)
    if (existingTables.length > 0) {
      console.log('6️⃣ Contando registros...');
      for (const table of existingTables) {
        try {
          const countResult = await client.query(`SELECT COUNT(*) as count FROM ${table}`);
          console.log(`   📊 ${table}: ${countResult.rows[0].count} registros`);
        } catch (err) {
          console.log(`   ⚠️  ${table}: Erro ao contar (${err.message})`);
        }
      }
      console.log('');
    }
    
    // Resumo
    console.log('========================================');
    console.log('  Resumo do Teste');
    console.log('========================================');
    console.log('✅ Conexão: OK');
    console.log(`📊 Tabelas: ${existingTables.length}/3`);
    console.log(`🔒 RLS: ${rlsResult.rows.filter(r => r.rowsecurity).length}/${rlsResult.rows.length} habilitado`);
    console.log(`🛡️  Policies: ${policiesResult.rows.reduce((sum, r) => sum + parseInt(r.policy_count), 0)} criadas`);
    console.log('========================================\n');
    
    if (existingTables.length === 3) {
      console.log('🎉 Banco de dados configurado corretamente!\n');
    } else {
      console.log('⚠️  Execute as migrações para criar as tabelas:\n');
      console.log('   supabase/migrations/001_initial_schema.sql\n');
    }
    
  } catch (error) {
    console.error('\n❌ Erro na conexão:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Verifique:');
      console.error('   - Se o host está correto');
      console.error('   - Se a porta está acessível');
      console.error('   - Se as credenciais estão corretas\n');
    } else if (error.code === '28P01') {
      console.error('\n💡 Erro de autenticação:');
      console.error('   - Verifique se a senha está correta\n');
    }
    process.exit(1);
  } finally {
    await client.end();
  }
}

testConnection();

