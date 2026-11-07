import sanAndreasLogo from "@/assets/san_andreas_logo.webp";
import { UserCounter } from "./UserCounter";
export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-50">
      <div
        className="pointer-events-none absolute bg-black/75 inset-x-0 top-0 -bottom-8 backdrop-blur-sm mask-[linear-gradient(to_bottom,black_0%,black_75%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,black_0%,black_75%,transparent_100%)]"
      />
      <div className="relative">
        <nav className="p-4 flex justify-between items-center md:mx-32">
          <HomePage />
          <div className="flex flex-col items-end">
            <URLs />
            <UserCounter
              label={(count) => `${count} TOTAL USER${count === 1 ? "" : "S"}`}
            />
          </div>
        </nav>
      </div>
    </header>
  );
}


function HomePage() {
  return <div>
    <a href="/">
      <img src={sanAndreasLogo.src} alt="home" className="w-32 sm:w-48" />
    </a>
  </div>
}

function URLs() {
  return <div className="flex gap-8">
    {[
      { label: "about", link: "/about" },
      {
        label: "github",
        link: "https://github.com/bedro0/RadioSanAndreas",
      },
    ].map(({ label, link }, index) => (
      <a className="text-xl lg:text-3xl" key={index} href={link}>
        {label.toUpperCase()}
      </a>
    ))}
  </div>
}