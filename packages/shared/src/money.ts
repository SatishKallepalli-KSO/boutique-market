/** All money in this codebase is integer paise (₹1 = 100 paise). Never use floats. */
export class Money {
  constructor(public readonly paise: number) {
    if (!Number.isInteger(paise)) {
      throw new Error('Money must be an integer number of paise')
    }
    if (paise < 0) {
      throw new Error('Money cannot be negative')
    }
  }

  static fromRupees(rupees: number): Money {
    return new Money(Math.round(rupees * 100))
  }

  add(other: Money): Money {
    return new Money(this.paise + other.paise)
  }

  multiply(qty: number): Money {
    if (!Number.isInteger(qty) || qty < 0) {
      throw new Error('Quantity must be a non-negative integer')
    }
    return new Money(this.paise * qty)
  }

  formatINR(): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(this.paise / 100)
  }
}

export function formatINR(paise: number): string {
  return new Money(paise).formatINR()
}
