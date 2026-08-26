import sanAndreasLogo from "@/assets/san_andreas_logo.webp";
export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-50">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -bottom-8 backdrop-blur-sm mask-[linear-gradient(to_bottom,black_0%,black_75%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,black_0%,black_75%,transparent_100%)]"
      />
      <div className="relative">
        <nav className="p-4 flex justify-between items-center  lg:mx-[20%] md:mx-[15%]">
          <div>
            <a href="/">
              <img src={sanAndreasLogo.src} alt="home" className="w-3xs" />
            </a>
          </div>
          <div>
            {[
              { label: "about", link: "/about" },
              {
                label: "github",
                link: "https://github.com/bedro0/RadioSanAndreas",
              },
            ].map(({ label, link }, index) => (
              <a className="mx-4 text-3xl" key={index} href={link}>
                {label.toUpperCase()}
              </a>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
}
