import MypageProfileClient from "./_components/MypageProfileClient";
import MypageAddressSection from "./_components/MypageAddressSection";
import MypageActions from "./_components/MypageActions";

export default function MypagePage() {
  return (
    <div className="space-y-4">
      <MypageProfileClient />
      <MypageAddressSection />
      <MypageActions />
    </div>
  );
}
