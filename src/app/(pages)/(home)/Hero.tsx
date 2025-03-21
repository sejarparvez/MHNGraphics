"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import img1 from "@/images/hero/1.jpg";
import img2 from "@/images/hero/2.jpg";
import img3 from "@/images/hero/3.jpg";
import { Search } from "lucide-react";
import Image, { StaticImageData } from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import HeroSkeleton from "./skeleton";

const imageArray: StaticImageData[] = [img1, img2, img3];

export default function Hero() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [backgroundImage, setBackgroundImage] = useState<StaticImageData>(img1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const randomImage =
      imageArray[Math.floor(Math.random() * imageArray.length)];
    setBackgroundImage(randomImage);
    setIsLoading(false);
  }, [pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const formattedQuery = searchQuery.trim().replace(/\s+/g, "+");
    router.push(`/design?category=all&query=${formattedQuery}&page=1`);
  };

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  if (isLoading) {
    return <HeroSkeleton />;
  }

  return (
    <div className="relative">
      <Image
        src={backgroundImage}
        alt="Hero banner image showcasing creative designs"
        width={1920}
        height={1080}
        priority
        placeholder="blur"
        className="h-96 w-full object-cover brightness-50 md:h-[29.5rem]"
        onError={() => setError("Failed to load image")}
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center space-y-6 bg-black bg-opacity-40 px-4 md:space-y-8 lg:space-y-10">
        <div className="mt-10 text-center">
          <h1 className="mb-4 text-2xl font-bold text-white drop-shadow-lg sm:text-3xl md:text-4xl lg:text-5xl">
            Design Smarter, Create Better
          </h1>
          <p className="text-sm text-slate-200 drop-shadow sm:text-base md:text-lg lg:text-xl">
            Premium resources at your fingertips to craft outstanding designs
            with ease and speed.
          </p>
        </div>
        <form
          onSubmit={handleSearch}
          className="w-full max-w-xl sm:max-w-2xl md:max-w-3xl"
        >
          <div className="relative flex-grow">
            <Input
              type="text"
              placeholder="Search MHN Graphics"
              value={searchQuery}
              className="h-14 focus-visible:ring-0"
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search input"
            />
            <Button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 focus:ring-0"
              aria-label="Submit search"
            >
              <Search className="h-5 w-5 text-white" />
              <span className="hidden md:block">Search</span>
            </Button>
          </div>
        </form>
        <div className="flex flex-wrap gap-5 md:gap-10">
          <Link href="/design?category=all&query=&page=1">
            <Button variant="secondary">Design</Button>
          </Link>
          <Link href="/design?category=photos&query=&page=1">
            <Button variant="secondary">Photos</Button>
          </Link>
          <Link href="/design?category=animation&query=&page=1">
            <Button variant="secondary">Animation</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
