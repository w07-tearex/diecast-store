import Link from 'next/link';

export default function MainMenu() {
    const menuItems = ['IN STOCK', 'PRE-ORDER', 'ACCESSORIES'];

    return (
        <nav className="relative w-full bg-[#161b22]/95 backdrop-blur-md border-b border-white/5 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-center md:justify-start">
                <div className="flex space-x-8 text-sm font-semibold text-zinc-400">
                    {menuItems.map((item) => (
                        <Link
                            key={item}
                            href="#"
                            className="relative hover:text-white transition-colors duration-300 group py-1"
                        >
                            {item}
                            <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-[#FF42B0] transition-all duration-300 group-hover:w-full shadow-[0_0_8px_#FF42B0]"></span>
                        </Link>
                    ))}
                </div>
            </div>
        </nav>
    );
}