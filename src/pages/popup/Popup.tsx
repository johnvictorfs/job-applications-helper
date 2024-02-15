import '@/assets/styles/tailwind.css'
import { AutoFillOptions } from "@/components/app/AutoFillOptions";

export default function Popup(): JSX.Element {
  return (
    <div className="w-96 h-[36rem]">
      <AutoFillOptions />
    </div>
  )
}
