
const Title = ({
  title = 'Chat App',
  description = 'This is a chat app',
}) => {
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
    </>
  );
};

export default Title;
