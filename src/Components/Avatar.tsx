import Image from "next/image";

export default function Avatar({
    src,
  }:{
    src:string;
  }) {
    return (
      <div className="relative size-16 aspect-square overflow-hidden rounded-full">
      <Image
        src={src}
        alt="Avatar"
        layout="fill" 
        objectFit="cover" 
        quality={100} 
      />
    </div>
    );
  }