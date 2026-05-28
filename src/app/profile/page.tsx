
import { Navbar } from "@/components/layout/Navbar";
import { ProfileOptimizerUI } from "@/components/profile/ProfileOptimizerUI";

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-[#f3f1ed]">
      <Navbar />
      <main>
        <ProfileOptimizerUI />
      </main>
    </div>
  );
}
