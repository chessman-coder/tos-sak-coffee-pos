import { Link, usePage } from '@inertiajs/react';

const itemBaseStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    color: '#f8efe7',
    textDecoration: 'none',
    fontSize: '20px',
    fontWeight: 500,
    borderRadius: '12px',
    padding: '12px 14px',
    marginBottom: '8px',
    transition: 'all 0.2s ease',
};

export default function Sidebar() {
    const { auth, can = {} } = usePage().props;

    const menuItems = [
        {
            label: 'Dashboard',
            icon: 'fa-solid fa-grip',
            href: route('dashboard'),
            active: route().current('dashboard'),
            show: true,
        },
        {
            label: 'My Staff',
            icon: 'fa-regular fa-user',
            href: can['user-list'] ? route('users.index') : '#',
            active: route().current('users.index') || route().current('users.create'),
            show: true,
        },
        {
            label: 'Analytics',
            icon: 'fa-solid fa-chart-column',
            href: '#',
            active: false,
            show: true,
        },
        {
            label: 'Inventory',
            icon: 'fa-solid fa-cart-shopping',
            href: '#',
            active: false,
            show: true,
        },
        {
            label: 'Menu',
            icon: 'fa-solid fa-utensils',
            href: can['category-list'] ? route('categories.index') : '#',
            active: route().current('categories.index') || route().current('categories.create'),
            show: true,
        },
        {
            label: 'Order List',
            icon: 'fa-regular fa-calendar',
            href: '#',
            active: false,
            show: true,
        },
        {
            label: 'Setting',
            icon: 'fa-solid fa-gear',
            href: can['role-list'] ? route('roles.index') : '#',
            active: route().current('roles.index') || route().current('roles.create'),
            show: true,
        },
    ];

    return (
        <aside
            style={{
                width: '290px',
                minHeight: '100vh',
                background: 'linear-gradient(180deg, #56312f 0%, #5d322d 100%)',
                borderRight: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '20px 14px',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '22px' }}>
                <h2 style={{ margin: 0, color: '#e3b071', fontWeight: 700, fontSize: '42px', lineHeight: 1 }}>Logo</h2>
                <button
                    type="button"
                    style={{
                        border: 'none',
                        background: 'transparent',
                        color: '#d29a62',
                        fontSize: '28px',
                        cursor: 'pointer',
                        lineHeight: 1,
                    }}
                >
                    <i className="fa-solid fa-angles-left"></i>
                </button>
            </div>

            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: '#f0f0f0',
                    borderRadius: '10px',
                    padding: '8px 10px',
                    marginBottom: '22px',
                }}
            >
                <img
                    src="/images/avatar.png"
                    alt="User"
                    style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '8px',
                        objectFit: 'cover',
                        marginRight: '12px',
                    }}
                />
                <div style={{ flex: 1 }}>
                    <div style={{ color: '#222', fontSize: '22px', fontWeight: 700, lineHeight: 1.2 }}>
                        {auth?.user?.name || 'User Name'}
                    </div>
                    <div style={{ color: '#646464', fontSize: '16px', fontStyle: 'italic', lineHeight: 1.2 }}>Admin</div>
                </div>
                <i className="fa-solid fa-caret-down" style={{ color: '#111', fontSize: '18px' }}></i>
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column' }}>
                {menuItems
                    .filter((item) => item.show)
                    .map((item) => (
                        <Link
                            key={item.label}
                            href={item.href}
                            style={{
                                ...itemBaseStyle,
                                backgroundColor: item.active ? '#d69a5d' : 'transparent',
                                color: item.active ? '#fdf6ef' : '#f7ede4',
                            }}
                        >
                            <i
                                className={item.icon}
                                style={{
                                    width: '20px',
                                    fontSize: '20px',
                                    textAlign: 'center',
                                    opacity: item.active ? 1 : 0.95,
                                }}
                            ></i>
                            <span style={{ fontSize: '30px', lineHeight: 1.15 }}>{item.label}</span>
                        </Link>
                    ))}
            </nav>

            <div style={{ marginTop: 'auto', paddingBottom: '8px', paddingLeft: '46px' }}>
                <Link
                    href={route('logout')}
                    method="post"
                    as="button"
                    style={{
                        border: '1.6px solid #eadccc',
                        borderRadius: '12px',
                        background: 'transparent',
                        color: '#f3e4d4',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '10px',
                        fontSize: '28px',
                        padding: '8px 16px',
                        cursor: 'pointer',
                    }}
                >
                    <i className="fa-solid fa-arrow-right-from-bracket"></i>
                    <span>Log Out</span>
                </Link>
            </div>
        </aside>
    );
}
