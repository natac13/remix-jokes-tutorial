export default function NewJokeRoute() {
  return (
    <div>
      <h1>New Joke</h1>
      <form>
        <div>
          <label htmlFor="name">Name</label>
          <input id="name" name="name" type="text" />
        </div>
        <div>
          <label htmlFor="content">Content</label>
          <textarea id="content" name="content" />
        </div>
        <button type="submit">Add</button>
      </form>
    </div>
  );
}
