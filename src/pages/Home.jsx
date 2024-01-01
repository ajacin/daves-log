import { useState } from "react";
import { useUser } from "../lib/context/user";
import { useIdeas } from "../lib/context/ideas";

export function Home() {
    const user = useUser();
    const ideas = useIdeas();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {/* Show the submit form to logged in users. */}
            {user.current ? (
                <section className="mt-8">
                    <h2 className="text-2xl font-bold mb-4">Submit Idea</h2>
                    <form>
                        <input
                            type="text"
                            placeholder="Title"
                            value={title}
                            onChange={(event) => {
                                setTitle(event.target.value);
                            }}
                            className="w-full p-2 mb-4 border rounded"
                        />
                        <textarea
                            placeholder="Description"
                            value={description}
                            onChange={(event) => {
                                setDescription(event.target.value);
                            }}
                            className="w-full p-2 mb-4 border rounded"
                        />
                        <button
                            type="button"
                            onClick={() =>
                                ideas.add({ userId: user.current.$id, title, description })
                            }
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Submit
                        </button>
                    </form>
                </section>
            ) : (
                <section className="mt-8">
                    <p className="text-lg">Please login to submit an idea.</p>
                </section>
            )}
            <section className="mt-8">
    <h2 className="text-2xl font-bold mb-4 text-gray-800">Latest Ideas</h2>
    <div className="bg-white shadow-md rounded my-6">
        <table className="text-left w-full border-collapse">
            <thead>
                <tr>
                    <th className="py-4 px-6 bg-grey-lightest font-bold uppercase text-sm text-grey-dark border-b border-grey-light">Title</th>
                    <th className="py-4 px-6 bg-grey-lightest font-bold uppercase text-sm text-grey-dark border-b border-grey-light">Description</th>
                    <th className="py-4 px-6 bg-grey-lightest font-bold uppercase text-sm text-grey-dark border-b border-grey-light"></th>
                </tr>
            </thead>
            <tbody>
                {ideas.current.map((idea) => (
                    <tr className="hover:bg-grey-lighter" key={idea.$id}>
                        <td className="py-4 px-6 border-b border-grey-light">{idea.title}</td>
                        <td className="py-4 px-6 border-b border-grey-light">{idea.description}</td>
                        <td className="py-4 px-6 border-b border-grey-light">
                            {/* Show the remove button to idea owner. */}
                            {user.current && user.current.$id === idea.userId && (
                                <button
                                    type="button"
                                    onClick={() => ideas.remove(idea.$id)}
                                    className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                                >
                                    Remove
                                </button>
                            )}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
</section>
        </div>
    );
}