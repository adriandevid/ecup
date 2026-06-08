import AppContent from "@/components/content";
import { AppProvider } from "@/contexts/AppContext";
import { queryOne } from "@/lib/db";
import { verifyToken } from "@/lib/jwt";
import { Permission } from "@/types";
import { cookies } from "next/headers";

export default async function Home() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('futchamp_token');

    if (token) {
      const payload = await verifyToken(token.value);
      const permission = await queryOne<Permission>(
        'SELECT id, role_id, user_id FROM permissions WHERE user_id = $1',
        [payload.userId]
      );

      if (permission != null) {
        return (
          <AppProvider roleId={permission.role_id}>
            <div className="text-slate-100 min-h-screen flex flex-col">
              <AppContent />
            </div>
          </AppProvider>
        );
      }
    }

    return (
      <AppProvider roleId={0}>
        <div className="text-slate-100 min-h-screen flex flex-col">
          <AppContent />
        </div>
      </AppProvider>
    );
  } catch (ex: any) {
    return (
      <AppProvider roleId={0}>
        <div className="text-slate-100 min-h-screen flex flex-col">
          <AppContent />
        </div>
      </AppProvider>
    );
  }
}
