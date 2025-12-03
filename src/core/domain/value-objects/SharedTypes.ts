/**
 * ImageProof Value Object
 * Represents proof image with validation
 */
export class ImageProof {
  private constructor(private readonly path: string) {
    if (!path || path.trim().length === 0) {
      throw new Error('Image proof path cannot be empty');
    }
  }

  static fromPath(path: string): ImageProof {
    return new ImageProof(path.trim());
  }

  getPath(): string {
    return this.path;
  }

  equals(other: ImageProof): boolean {
    return this.path === other.path;
  }

  toString(): string {
    return this.path;
  }
}

/**
 * LateApprovalStatus Enum
 */
export enum LateApprovalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

/**
 * AttendanceStatus Enum
 */
export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  LATE = 'LATE',
  EXCUSED = 'EXCUSED'
}