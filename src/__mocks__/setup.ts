/**
 * Setup global dos testes — Vaidoso FC
 *
 * Executado uma vez antes de todos os arquivos de teste.
 * Configura: jsdom, matchers do Testing Library, mocks globais.
 */

import '@testing-library/jest-dom';
import { vi, beforeEach, afterEach } from 'vitest';

// ── Mocks globais de browser APIs ─────────────────────────────────────────────

// localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem:    (k: string) => store[k] ?? null,
    setItem:    (k: string, v: string) => { store[k] = v; },
    removeItem: (k: string) => { delete store[k]; },
    clear:      () => { store = {}; },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// window.confirm — retorna true por padrão (simula o usuário confirmando)
Object.defineProperty(window, 'confirm', {
  writable: true,
  value: vi.fn(() => true),
});

// window.alert
Object.defineProperty(window, 'alert', {
  writable: true,
  value: vi.fn(),
});

// IntersectionObserver (necessário para componentes com scroll)
class IntersectionObserverMock {
  observe   = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
Object.defineProperty(window, 'IntersectionObserver', {
  value: IntersectionObserverMock,
  writable: true,
});

// ResizeObserver
class ResizeObserverMock {
  observe    = vi.fn();
  unobserve  = vi.fn();
  disconnect = vi.fn();
}
Object.defineProperty(window, 'ResizeObserver', {
  value: ResizeObserverMock,
  writable: true,
});

// ── Lifecycle ─────────────────────────────────────────────────────────────────

beforeEach(() => {
  localStorageMock.clear();
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});
