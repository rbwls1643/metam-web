type Props = {
  game: string;
  onChange: (v: string) => void;
};

const games = [
  "PUBG PC",
  "NEW STATE MOBILE",
  "PUBG: Blindspot",
  "PUBG: Black Budget",
];

export default function GameTabs({ game, onChange }: Props) {
  return (
    <div className="mb-5 flex flex-wrap gap-2">
      {games.map((g) => {
        const active = game === g;

        return (
          <button
            key={g}
            onClick={() => onChange(g)}
            className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
              active
                ? "bg-blue-600 text-white shadow-sm"
                : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            {g}
          </button>
        );
      })}
    </div>
  );
}