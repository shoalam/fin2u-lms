import { redirect } from 'next/navigation';

export default function AdminEmailSettingsRedirect() {
  redirect('/admin/settings?tab=email');
}
