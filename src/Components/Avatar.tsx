import Image from 'next/image';

type AvatarProps = {
  src?: string | null;
};

const Avatar = ({ src }: AvatarProps) => {
  return (
    <div className="relative size-16 aspect-square overflow-hidden rounded-full">
      {src ? (
        <Image
          src={src}
          alt="Avatar"
          fill
          style={{ objectFit: 'cover' }}
          quality={100}
        />
      ) : (
        <Image
          src="/userImage.png" 
          alt="Default Avatar"
          fill
          style={{ objectFit: 'cover' }}
          quality={100}
        />
      )}
    </div>
  );
};

export default Avatar;
