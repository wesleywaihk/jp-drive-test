# Japan Driving License Quiz

A true/false quiz app to practice for the Japan driving license exam.

## Features

- Random question order each session
- Choose how many questions to attempt (5, 10, 15, or all)
- Instant answer feedback with explanation after each question
- Full result review screen with score
- Supports question images (traffic signs, road markings)
- Responsive layout for mobile and desktop

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Adding Questions

Edit [`src/questions.json`](src/questions.json). Each entry follows this shape:

```json
{
  "id": "Q031",
  "question": "Your true/false statement here.",
  "image": "/img/optional-image.avif",
  "answer": true,
  "description": "Explanation shown after the question is answered."
}
```

| Field | Type | Required |
|---|---|---|
| `id` | string | Yes |
| `question` | string | Yes |
| `image` | string (path) | No |
| `answer` | boolean | Yes |
| `description` | string | Yes |

Place image files in the `public/img/` directory and reference them as `/img/filename.avif`.

## Project Structure

```
src/
├── questions.json        # Question bank
├── types.ts              # Question type definition
├── App.tsx               # App state (start → quiz → result)
└── components/
    ├── StartScreen.tsx   # Question count selection
    ├── QuizScreen.tsx    # Question display and answer input
    └── ResultScreen.tsx  # Score and answer review
```

## Tech Stack

- [Vite](https://vitejs.dev/) + [React](https://react.dev/) + TypeScript
- [Tailwind CSS](https://tailwindcss.com/)
