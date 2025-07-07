import Link from 'next/link';

export default function DashboardPage() {
  const links = [
    { href: '/dashboard/patients', label: 'Patients' },
    { href: '/dashboard/medicalReports', label: 'Medical Reports' },
    { href: '/dashboard/categories', label: 'Categories' },
    { href: '/dashboard/study-types', label: 'Study Types' },
    { href: '/dashboard/studies', label: 'Studies' },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <ul className="space-y-2">
        {links.map(link => (
          <li key={link.href}>
            <Link className="text-blue-600" href={link.href}>{link.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
