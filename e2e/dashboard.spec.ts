/**
 * E2E — Fluxo completo do Dashboard
 *
 * Testa navegação, criação de transação, filtros e relatório
 * em browser real (Chromium via Playwright).
 *
 * ⚠️  Estes testes rodam contra o app real em localhost:8080.
 *      Certifique-se de que `pnpm run dev` está ativo.
 */

import { test, expect, Page } from '@playwright/test';

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Injeta transações mockadas no localStorage antes de carregar a app */
async function seedTransactions(page: Page) {
  await page.addInitScript(() => {
    const transactions = [
      { id: 'e2e-1', description: 'Mensalidade E2E', amount: 80, type: 'income',  category: 'MENSALIDADE', date: new Date().toISOString().split('T')[0], user_id: 'e2e-user' },
      { id: 'e2e-2', description: 'Campo E2E',       amount: 350, type: 'expense', category: 'CAMPO',       date: new Date().toISOString().split('T')[0], user_id: 'e2e-user' },
      { id: 'e2e-3', description: 'Mensalidade Jan', amount: 80, type: 'income',  category: 'MENSALIDADE', date: '2026-01-15', user_id: 'e2e-user' },
    ];
    const cats = [
      { id: 'c1', name: 'MENSALIDADE',  type: 'income',  isDefault: true },
      { id: 'c2', name: 'CAMPO',        type: 'expense', isDefault: true },
      { id: 'c3', name: 'JUIZ',         type: 'expense', isDefault: true },
      { id: 'c4', name: 'CARTÃO AMARELO', type: 'income', isDefault: true },
    ];
    localStorage.setItem('transactions', JSON.stringify(transactions));
    localStorage.setItem('categories',   JSON.stringify(cats));
  });
}

// ── Testes ────────────────────────────────────────────────────────────────────

test.describe('Navegação e dashboard', () => {

  test.beforeEach(async ({ page }) => {
    await seedTransactions(page);
    await page.goto('/');
  });

  test('exibe o nome do clube no header', async ({ page }) => {
    await expect(page.getByText(/vaidoso fc/i).first()).toBeVisible();
  });

  test('navega para a aba Transações', async ({ page }) => {
    await page.getByRole('tab', { name: /transações/i }).click();
    await expect(page.getByText(/transações recentes/i)).toBeVisible();
  });

  test('navega para a aba Categorias', async ({ page }) => {
    await page.getByRole('tab', { name: /categorias/i }).click();
    await expect(page.getByText(/gerenciar categorias/i)).toBeVisible();
  });

  test('navega para a aba Artilharia', async ({ page }) => {
    await page.getByRole('tab', { name: /artilharia/i }).click();
    await expect(page.getByText(/artilharia/i).first()).toBeVisible();
  });

  test('navega para a aba Relatório', async ({ page }) => {
    await page.getByRole('tab', { name: /relatório/i }).click();
    await expect(page.getByText(/relatório do clube/i)).toBeVisible();
  });
});

test.describe('Transações — CRUD', () => {

  test.beforeEach(async ({ page }) => {
    await seedTransactions(page);
    await page.goto('/');
    await page.getByRole('tab', { name: /transações/i }).click();
  });

  test('exibe transações do localStorage na lista', async ({ page }) => {
    await expect(page.getByText('Mensalidade E2E')).toBeVisible();
    await expect(page.getByText('Campo E2E')).toBeVisible();
  });

  test('abre modal de nova transação ao clicar em "Nova Transação"', async ({ page }) => {
    await page.getByRole('button', { name: /nova transação/i }).click();
    await expect(page.getByRole('heading', { name: /nova transação/i })).toBeVisible();
  });

  test('fecha o modal ao clicar em Cancelar', async ({ page }) => {
    await page.getByRole('button', { name: /nova transação/i }).click();
    await page.getByRole('button', { name: /cancelar/i }).click();
    await expect(page.getByRole('heading', { name: /nova transação/i })).not.toBeVisible();
  });
});

test.describe('Filtros de data', () => {

  test.beforeEach(async ({ page }) => {
    await seedTransactions(page);
    await page.goto('/');
  });

  test('alterna para filtro Anual', async ({ page }) => {
    const anualBtn = page.getByRole('button', { name: /^anual$/i });
    if (await anualBtn.isVisible()) {
      await anualBtn.click();
      await expect(anualBtn).toHaveClass(/scale-105/);
    }
  });

  test('alterna para filtro Mensal', async ({ page }) => {
    const mensalBtn = page.getByRole('button', { name: /^mensal$/i });
    if (await mensalBtn.isVisible()) {
      await mensalBtn.click();
      // Deve exibir seletores de mês e ano
      await expect(page.getByText(/selecione o ano/i)).toBeVisible();
    }
  });
});

test.describe('Relatório — PDF', () => {

  test.beforeEach(async ({ page }) => {
    await seedTransactions(page);
    await page.goto('/');
    await page.getByRole('tab', { name: /relatório/i }).click();
  });

  test('exibe o botão de baixar PDF', async ({ page }) => {
    await expect(
      page.getByRole('button', { name: /baixar relatório/i })
    ).toBeVisible();
  });

  test('clique no PDF não lança erro', async ({ page }) => {
    // Captura erros de console
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    // Intercepta o download para não bloquear o teste
    const downloadPromise = page.waitForEvent('download', { timeout: 8000 }).catch(() => null);

    await page.getByRole('button', { name: /baixar relatório/i }).click();
    await downloadPromise;

    // Nenhum erro crítico
    const criticalErrors = errors.filter(e =>
      !e.includes('favicon') && !e.includes('analytics')
    );
    expect(criticalErrors).toHaveLength(0);
  });
});

test.describe('Categorias — CRUD', () => {

  test.beforeEach(async ({ page }) => {
    await seedTransactions(page);
    await page.goto('/');
    await page.getByRole('tab', { name: /categorias/i }).click();
  });

  test('exibe categorias padrão de saída', async ({ page }) => {
    await expect(page.getByText('CAMPO')).toBeVisible();
  });

  test('troca para aba de entradas e exibe categorias corretas', async ({ page }) => {
    await page.getByRole('tab', { name: /entradas/i }).click();
    await expect(page.getByText('MENSALIDADE')).toBeVisible();
  });

  test('adiciona nova categoria com sucesso', async ({ page }) => {
    const input = page.getByPlaceholder(/ex: entretenimento/i);
    await input.fill('NOVA CAT E2E');
    await page.getByRole('button', { name: /adicionar categoria/i }).click();
    await expect(page.getByText('NOVA CAT E2E')).toBeVisible();
  });

  test('exibe erro ao tentar adicionar categoria com nome vazio', async ({ page }) => {
    await page.getByRole('button', { name: /adicionar categoria/i }).click();
    // O toast de erro deve aparecer (Sonner/Radix toast)
    await expect(
      page.getByText(/nome.*vazio|vazio.*nome|não pode estar vazio/i)
    ).toBeVisible({ timeout: 3000 });
  });
});
