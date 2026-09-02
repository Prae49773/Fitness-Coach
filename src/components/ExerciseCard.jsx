import Button from './ui/Button'

export default function ExerciseCard({ exercise, onComplete }) {
  return (
    <div className="dashboard-card card-content flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-text">{exercise.name}</h3>
          <p className="text-sm text-text-secondary">{exercise.type}</p>
        </div>
        <span className="bg-primary/10 text-primary text-xs font-medium px-3 py-1.5 rounded-full">
          {exercise.duration} min
        </span>
      </div>
      <p className="text-sm text-text-secondary mb-4 flex-1">{exercise.description}</p>
      <div className="mt-auto pt-4">
        <p className="text-sm text-text-secondary mb-4">{exercise.calories} cal</p>
        <Button size="md" fullWidth onClick={() => onComplete?.(exercise)}>
          Start
        </Button>
      </div>
    </div>
  )
}
