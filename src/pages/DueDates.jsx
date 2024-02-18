import { useUser } from "../lib/context/user";
import jsonData from "../components/DueDateData";
import DueDateDisplay from "../components/DueDateDisplay";

export function DueDates() {
  const user = useUser();

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      {user.current ? (
        <section className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Due Dates</h2>
          <div>
            {jsonData && jsonData.length > 0 ? (
              jsonData.map((item, index) => (
                <DueDateDisplay
                  key={index}
                  title={item.title}
                  date={item.date}
                />
              ))
            ) : (
              <p>No due dates available</p>
            )}
          </div>
        </section>
      ) : (
        <section className="mt-8">
          <p className="text-lg">Please login.</p>
        </section>
      )}
    </div>
  );
}
