import { Modal } from '../ui/Modal'
import { FilterSidebar } from './FilterSidebar'

interface FilterDrawerProps {
  open: boolean
  onClose: () => void
}

export function FilterDrawer({ open, onClose }: FilterDrawerProps) {
  return (
    <Modal open={open} onClose={onClose} title="Filters" size="md">
      <FilterSidebar className="w-full" />
    </Modal>
  )
}
