import MypageProfileClient from "./_components/MypageProfileClient";
import MypageAddressSection from "./_components/MypageAddressSection";

export default function MypagePage() {
  return (
    <div className="space-y-4">
      <MypageProfileClient />
      <MypageAddressSection />
    </div>
  );
}
