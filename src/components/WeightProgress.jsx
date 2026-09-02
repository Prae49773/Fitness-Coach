import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function WeightProgress({ data }) {
  return (
    <div className="bg-surface p-6 rounded-2xl shadow-sm">
      <h3 className="text-lg font-bold text-text mb-4">Weight Progress</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="weight" stroke="var(--color-primary)" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
