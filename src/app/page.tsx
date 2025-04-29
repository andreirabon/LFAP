import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen">
      <section className="min-h-screen bg-gradient-to-br from-white via-white to-white animate-gradient-x">
        <div className="absolute inset-0 bg-grid-gray-100/[0.05] bg-[size:60px_60px]" />
        <div className="min-h-screen container mx-auto px-4">
          <div className="min-h-screen flex flex-col md:flex-row items-center justify-center gap-8">
            <div className="flex-1">
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 leading-tight text-gray-800">
                Department of Science and Technology
                <br />
                <span className="text-[#49C4D3] font-extrabold">Leave Filing and Approval System</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 max-w-xl mb-8">
                Your Central Hub for DOST Leave: File requests seamlessly, monitor progress instantly, and manage
                approvals efficiently.
              </p>
            </div>
            <div className="flex-1 relative w-full max-w-lg">
              <div className="relative h-[350px]">
                <Image
                  src="/undraw_hero1.svg"
                  alt="DOST Leave Management"
                  fill
                  className="object-contain"
                  priority
                  loading="eager"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
