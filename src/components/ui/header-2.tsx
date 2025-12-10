/**
 * header-2.tsx
 * 
 * Componente de header/navegação principal da aplicação
 * 
 * Funcionalidades:
 * - Navegação entre abas principais
 * - Header sticky com efeito de blur ao rolar
 * - Menu mobile responsivo
 * - Toggle de tema
 * - Logo e branding
 * 
 * @author Vaidoso FC
 * @version 1.0.0
 */

import React from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MenuToggleIcon } from '@/components/ui/menu-toggle-icon';
import { useScroll } from '@/components/ui/use-scroll';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { DollarSign } from 'lucide-react';

/**
 * Props do componente Header
 */
interface HeaderProps {
	activeTab?: string; // Aba atualmente ativa
	onTabChange?: (tab: string) => void; // Callback quando aba muda
}

/**
 * Componente Header
 * 
 * Header responsivo com navegação principal e menu mobile
 * 
 * @param {HeaderProps} props - Props do componente
 * @returns {JSX.Element} Header completo
 */
export function Header({ activeTab, onTabChange }: HeaderProps) {
	// Estados
	const [open, setOpen] = React.useState(false); // Controla menu mobile aberto/fechado
	const scrolled = useScroll(10); // Detecta se página foi rolada (threshold: 10px)

	/**
	 * Links de navegação principais
	 * Define as abas disponíveis no header
	 */
	const links = [
		{
			label: 'Dashboard',
			value: 'dashboard',
		},
		{
			label: 'Transações',
			value: 'transactions',
		},
		{
			label: 'Categorias',
			value: 'categories',
		},
		{
			label: 'Artilharia',
			value: 'artilharia',
		},
		{
			label: 'Relatório IA',
			value: 'ai-report',
		},
	];

	/**
	 * Efeito para desabilitar scroll quando menu mobile está aberto
	 * Previne scroll do body quando o menu overlay está visível
	 */
	React.useEffect(() => {
		if (open) {
			// Desabilita scroll quando menu está aberto
			document.body.style.overflow = 'hidden';
		} else {
			// Reabilita scroll quando menu está fechado
			document.body.style.overflow = '';
		}

		// Cleanup: garante que scroll seja reabilitado ao desmontar
		return () => {
			document.body.style.overflow = '';
		};
	}, [open]);

	return (
		<header
			className={cn(
				'sticky top-0 z-50 mx-auto w-full max-w-5xl border-b border-transparent md:rounded-md md:border md:transition-all md:ease-out',
				{
					'bg-background/95 supports-[backdrop-filter]:bg-background/50 border-border backdrop-blur-lg md:top-4 md:max-w-4xl md:shadow':
						scrolled && !open,
					'bg-background/90': open,
				},
			)}
		>
			<nav
				className={cn(
					'flex h-14 w-full items-center justify-between px-4 md:h-12 md:transition-all md:ease-out',
					{
						'md:px-2': scrolled,
					},
				)}
			>
				<div className="flex items-center gap-2">
					<DollarSign className="h-5 w-5 text-green-500" />
					<span className="text-lg font-bold text-foreground">Vaidoso FC</span>
				</div>
				<div className="hidden items-center gap-2 md:flex">
					{links.map((link, i) => (
						<button
							key={i}
							onClick={() => onTabChange?.(link.value)}
							className={cn(
								buttonVariants({ variant: 'ghost' }),
								activeTab === link.value && 'bg-accent text-accent-foreground'
							)}
						>
							{link.label}
						</button>
					))}
					<ThemeToggle />
				</div>
				<div className="flex items-center gap-2 md:hidden">
					<ThemeToggle />
					<Button size="icon" variant="outline" onClick={() => setOpen(!open)}>
						<MenuToggleIcon open={open} className="size-5" duration={300} />
					</Button>
				</div>
			</nav>

			<div
				className={cn(
					'bg-background/90 fixed top-14 right-0 bottom-0 left-0 z-50 flex flex-col overflow-hidden border-y md:hidden',
					open ? 'block' : 'hidden',
				)}
			>
				<div
					data-slot={open ? 'open' : 'closed'}
					className={cn(
						'data-[slot=open]:animate-in data-[slot=open]:zoom-in-95 data-[slot=closed]:animate-out data-[slot=closed]:zoom-out-95 ease-out',
						'flex h-full w-full flex-col justify-between gap-y-2 p-4',
					)}
				>
					<div className="grid gap-y-2">
						{links.map((link) => (
							<button
								key={link.label}
								onClick={() => {
									onTabChange?.(link.value);
									setOpen(false);
								}}
								className={cn(
									buttonVariants({
										variant: 'ghost',
										className: 'justify-start',
									}),
									activeTab === link.value && 'bg-accent text-accent-foreground'
								)}
							>
								{link.label}
							</button>
						))}
					</div>
				</div>
			</div>
		</header>
	);
}

