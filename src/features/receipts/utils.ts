export const formatMoney = (val: string | number) => {
  const num = typeof val === 'string' ? parseFloat(val) : val
  if (isNaN(num)) return '0.00'
  return new Intl.NumberFormat('az-AZ', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num / 100)
}

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('az-AZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Truncates 1.0000 -> 1, 1.5000 -> 1.5
export const formatQuantity = (val: string | number) => {
  const num = typeof val === 'string' ? parseFloat(val) : val
  if (isNaN(num)) return '0'
  // parseFloat automatically removes trailing zeros for display
  return num.toString()
}

// Logic: If value is 18, it means 18% (previously it was dividing by 100)
export const formatTax = (val: string | number) => {
  const num = typeof val === 'string' ? parseFloat(val) : val
  if (isNaN(num) || num === 0) return '0%'
  return `${num}%` 
}