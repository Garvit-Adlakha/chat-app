const Avatar = ({ src, alt, className }) => (
    <img src={src} alt={alt} className={`rounded-full object-cover ${className}`} />
);
export default Avatar