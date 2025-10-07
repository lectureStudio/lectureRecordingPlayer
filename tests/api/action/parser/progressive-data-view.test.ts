import { describe, it, expect, beforeEach } from 'vitest'
import { ProgressiveDataView } from '@/api/action/parser/progressive-data-view'

describe('ProgressiveDataView', () => {
  let buffer: ArrayBuffer
  let dataView: ProgressiveDataView

  beforeEach(() => {
    // Create a test buffer with various data types
    buffer = new ArrayBuffer(100)
    const view = new DataView(buffer)
    
    // Write test data (non-overlapping positions)
    view.setInt8(0, 127)
    view.setInt16(2, 32000)
    view.setInt32(4, 2000000000)
    view.setBigInt64(8, BigInt('9000000000000000000'))
    view.setUint8(16, 255)
    view.setUint16(18, 65000)
    view.setUint32(20, 4000000000)
    view.setFloat32(24, 3.14159)
    view.setFloat64(28, 2.718281828459045)
    
    // Write string data (null-terminated)
    const textEncoder = new TextEncoder()
    const textBytes = textEncoder.encode('Hello\0World\0')
    const textView = new Uint8Array(buffer, 34)
    textView.set(textBytes)
    
    dataView = new ProgressiveDataView(buffer)
  })

  describe('constructor', () => {
    it('should create instance with full buffer', () => {
      const view = new ProgressiveDataView(buffer)
      expect(view.byteOffset).toBe(0)
    })

    it('should create instance with byte offset', () => {
      const view = new ProgressiveDataView(buffer, 10)
      expect(view.byteOffset).toBe(10)
    })

    it('should create instance with byte offset and length', () => {
      const view = new ProgressiveDataView(buffer, 10, 20)
      expect(view.byteOffset).toBe(10)
    })
  })

  describe('byteOffset getter', () => {
    it('should return current offset', () => {
      expect(dataView.byteOffset).toBe(0)
      
      dataView.skip(5)
      expect(dataView.byteOffset).toBe(5)
    })
  })

  describe('skip', () => {
    it('should advance offset by specified amount', () => {
      expect(dataView.byteOffset).toBe(0)
      
      dataView.skip(10)
      expect(dataView.byteOffset).toBe(10)
      
      dataView.skip(5)
      expect(dataView.byteOffset).toBe(15)
    })

    it('should throw error when skipping beyond buffer bounds', () => {
      dataView.skip(95) // Near end of buffer
      
      expect(() => {
        dataView.skip(10) // This should exceed buffer length
      }).toThrow('Out of bounds')
    })

    it('should throw error when skipping exactly at buffer end', () => {
      dataView.skip(100) // At end of buffer
      
      expect(() => {
        dataView.skip(1) // This should exceed buffer length
      }).toThrow('Out of bounds')
    })
  })

  describe('getInt8', () => {
    it('should read signed 8-bit integer', () => {
      const value = dataView.getInt8()
      expect(value).toBe(127)
      expect(dataView.byteOffset).toBe(1)
    })

    it('should advance offset after reading', () => {
      const initialOffset = dataView.byteOffset
      dataView.getInt8()
      expect(dataView.byteOffset).toBe(initialOffset + 1)
    })
  })

  describe('getInt16', () => {
    it('should read signed 16-bit integer', () => {
      dataView.skip(2) // Skip to int16 position
      const value = dataView.getInt16()
      expect(value).toBe(32000)
      expect(dataView.byteOffset).toBe(4)
    })

    it('should read with little endian', () => {
      // Create a separate buffer with little-endian int16 data
      const littleEndianBuffer = new ArrayBuffer(100)
      const littleEndianView = new DataView(littleEndianBuffer)
      littleEndianView.setInt8(0, 127)
      littleEndianView.setInt16(1, 32000, true) // Write with little-endian
      
      const littleEndianDataView = new ProgressiveDataView(littleEndianBuffer)
      littleEndianDataView.skip(1) // Skip first byte
      const value = littleEndianDataView.getInt16(true)
      expect(value).toBe(32000)
    })
  })

  describe('getInt32', () => {
    it('should read signed 32-bit integer', () => {
      dataView.skip(4) // Skip to int32 position
      const value = dataView.getInt32()
      expect(value).toBe(2000000000)
      expect(dataView.byteOffset).toBe(8)
    })

    it('should read with little endian', () => {
      // Create a separate buffer with little-endian int32 data
      const littleEndianBuffer = new ArrayBuffer(100)
      const littleEndianView = new DataView(littleEndianBuffer)
      littleEndianView.setInt8(0, 127)
      littleEndianView.setInt16(1, 32000)
      littleEndianView.setInt32(3, 2000000000, true) // Write with little-endian
      
      const littleEndianDataView = new ProgressiveDataView(littleEndianBuffer)
      littleEndianDataView.skip(3)
      const value = littleEndianDataView.getInt32(true)
      expect(value).toBe(2000000000)
    })
  })

  describe('getBigInt64', () => {
    it('should read signed 64-bit big integer', () => {
      dataView.skip(8) // Skip to bigint position
      const value = dataView.getBigInt64()
      expect(value).toBe(BigInt('9000000000000000000'))
      expect(dataView.byteOffset).toBe(16)
    })

    it('should read with little endian', () => {
      // Create a separate buffer with little-endian bigint64 data
      const littleEndianBuffer = new ArrayBuffer(100)
      const littleEndianView = new DataView(littleEndianBuffer)
      littleEndianView.setInt8(0, 127)
      littleEndianView.setInt16(1, 32000)
      littleEndianView.setInt32(3, 2000000000)
      littleEndianView.setBigInt64(7, BigInt('9000000000000000000'), true) // Write with little-endian
      
      const littleEndianDataView = new ProgressiveDataView(littleEndianBuffer)
      littleEndianDataView.skip(7)
      const value = littleEndianDataView.getBigInt64(true)
      expect(value).toBe(BigInt('9000000000000000000'))
    })
  })

  describe('getUint8', () => {
    it('should read unsigned 8-bit integer', () => {
      dataView.skip(16) // Skip to uint8 position
      const value = dataView.getUint8()
      expect(value).toBe(255)
      expect(dataView.byteOffset).toBe(17)
    })
  })

  describe('getUint16', () => {
    it('should read unsigned 16-bit integer', () => {
      dataView.skip(18) // Skip to uint16 position
      const value = dataView.getUint16()
      expect(value).toBe(65000)
      expect(dataView.byteOffset).toBe(20)
    })

    it('should read with little endian', () => {
      // Create a separate buffer with little-endian uint16 data
      const littleEndianBuffer = new ArrayBuffer(100)
      const littleEndianView = new DataView(littleEndianBuffer)
      littleEndianView.setInt8(0, 127)
      littleEndianView.setInt16(1, 32000)
      littleEndianView.setInt32(3, 2000000000)
      littleEndianView.setBigInt64(7, BigInt('9000000000000000000'))
      littleEndianView.setUint8(15, 255)
      littleEndianView.setUint16(16, 65000, true) // Write with little-endian
      
      const littleEndianDataView = new ProgressiveDataView(littleEndianBuffer)
      littleEndianDataView.skip(16)
      const value = littleEndianDataView.getUint16(true)
      expect(value).toBe(65000)
    })
  })

  describe('getUint32', () => {
    it('should read unsigned 32-bit integer', () => {
      dataView.skip(20) // Skip to uint32 position
      const value = dataView.getUint32()
      expect(value).toBe(4000000000)
      expect(dataView.byteOffset).toBe(24)
    })

    it('should read with little endian', () => {
      // Create a separate buffer with little-endian uint32 data
      const littleEndianBuffer = new ArrayBuffer(100)
      const littleEndianView = new DataView(littleEndianBuffer)
      littleEndianView.setInt8(0, 127)
      littleEndianView.setInt16(1, 32000)
      littleEndianView.setInt32(3, 2000000000)
      littleEndianView.setBigInt64(7, BigInt('9000000000000000000'))
      littleEndianView.setUint8(15, 255)
      littleEndianView.setUint16(16, 65000)
      littleEndianView.setUint32(18, 4000000000, true) // Write with little-endian
      
      const littleEndianDataView = new ProgressiveDataView(littleEndianBuffer)
      littleEndianDataView.skip(18)
      const value = littleEndianDataView.getUint32(true)
      expect(value).toBe(4000000000)
    })
  })

  describe('getFloat32', () => {
    it('should read 32-bit floating point number', () => {
      dataView.skip(24) // Skip to float32 position
      const value = dataView.getFloat32()
      expect(value).toBeCloseTo(3.14159, 5)
      expect(dataView.byteOffset).toBe(28)
    })

    it('should read with little endian', () => {
      // Create a separate buffer with little-endian float32 data
      const littleEndianBuffer = new ArrayBuffer(100)
      const littleEndianView = new DataView(littleEndianBuffer)
      littleEndianView.setInt8(0, 127)
      littleEndianView.setInt16(1, 32000)
      littleEndianView.setInt32(3, 2000000000)
      littleEndianView.setBigInt64(7, BigInt('9000000000000000000'))
      littleEndianView.setUint8(15, 255)
      littleEndianView.setUint16(16, 65000)
      littleEndianView.setUint32(18, 4000000000)
      littleEndianView.setFloat32(22, 3.14159, true) // Write with little-endian
      
      const littleEndianDataView = new ProgressiveDataView(littleEndianBuffer)
      littleEndianDataView.skip(22)
      const value = littleEndianDataView.getFloat32(true)
      expect(value).toBeCloseTo(3.14159, 5)
    })
  })

  describe('getFloat64', () => {
    it('should read 64-bit floating point number', () => {
      dataView.skip(28) // Skip to float64 position
      const value = dataView.getFloat64()
      expect(value).toBeCloseTo(2.718281828459045, 10)
      expect(dataView.byteOffset).toBe(36)
    })

    it('should read with little endian', () => {
      // Create a separate buffer with little-endian float64 data
      const littleEndianBuffer = new ArrayBuffer(100)
      const littleEndianView = new DataView(littleEndianBuffer)
      littleEndianView.setFloat64(26, 2.718281828459045, true) // Write with little-endian
      
      const littleEndianDataView = new ProgressiveDataView(littleEndianBuffer)
      littleEndianDataView.skip(26)
      const value = littleEndianDataView.getFloat64(true)
      expect(value).toBeCloseTo(2.718281828459045, 15)
    })
  })

  describe('getString', () => {
    it('should read null-terminated string', () => {
      dataView.skip(34) // Skip to string position
      const value = dataView.getString(6) // "Hello\0"
      expect(value).toBe('Hello')
      expect(dataView.byteOffset).toBe(40)
    })

    it('should read string with specified length', () => {
      dataView.skip(34)
      const value = dataView.getString(11) // "Hello\0World\0"
      expect(value).toBe('Hello')
      expect(dataView.byteOffset).toBe(40) // Stops at first null terminator after 6 bytes
    })

    it('should handle empty string', () => {
      const emptyBuffer = new ArrayBuffer(1)
      new DataView(emptyBuffer).setUint8(0, 0)
      const emptyView = new ProgressiveDataView(emptyBuffer)
      
      const value = emptyView.getString(1)
      expect(value).toBe('')
    })

    it('should handle string without null terminator', () => {
      const testBuffer = new ArrayBuffer(5)
      const testView = new Uint8Array(testBuffer)
      testView.set([72, 101, 108, 108, 111]) // "Hello"
      const view = new ProgressiveDataView(testBuffer)
      
      const value = view.getString(5)
      expect(value).toBe('Hello')
    })

    it('should handle string with null terminator before end', () => {
      const testBuffer = new ArrayBuffer(8)
      const testView = new Uint8Array(testBuffer)
      testView.set([72, 101, 0, 108, 108, 111, 0, 0]) // "He\0llo\0\0"
      const view = new ProgressiveDataView(testBuffer)
      
      const value = view.getString(8)
      expect(value).toBe('He')
    })

    it('should handle string with only null characters', () => {
      const testBuffer = new ArrayBuffer(3)
      const testView = new Uint8Array(testBuffer)
      testView.set([0, 0, 0])
      const view = new ProgressiveDataView(testBuffer)
      
      const value = view.getString(3)
      expect(value).toBe('')
    })
  })

  describe('edge cases', () => {
    it('should handle reading at buffer boundaries', () => {
      const smallBuffer = new ArrayBuffer(4)
      new DataView(smallBuffer).setInt32(0, 12345)
      const view = new ProgressiveDataView(smallBuffer)
      
      const value = view.getInt32()
      expect(value).toBe(12345)
      expect(view.byteOffset).toBe(4)
    })

    it('should handle zero-length buffer', () => {
      const emptyBuffer = new ArrayBuffer(0)
      const view = new ProgressiveDataView(emptyBuffer)
      
      expect(view.byteOffset).toBe(0)
      expect(() => view.skip(1)).toThrow('Out of bounds')
    })

    it('should handle reading with different endianness', () => {
      const testBuffer = new ArrayBuffer(4)
      const testView = new DataView(testBuffer)
      testView.setInt32(0, 0x12345678, true) // little endian
      
      const view = new ProgressiveDataView(testBuffer)
      const littleEndianValue = view.getInt32(true)
      expect(littleEndianValue).toBe(0x12345678)
      
      // Reset and read as big endian
      const view2 = new ProgressiveDataView(testBuffer)
      const bigEndianValue = view2.getInt32(false)
      expect(bigEndianValue).not.toBe(0x12345678)
    })
  })

  describe('sequential reading', () => {
    it('should read multiple values sequentially', () => {
      const testBuffer = new ArrayBuffer(12)
      const testView = new DataView(testBuffer)
      testView.setInt32(0, 100)
      testView.setFloat32(4, 3.14)
      testView.setInt32(8, 200)
      
      const view = new ProgressiveDataView(testBuffer)
      
      expect(view.getInt32()).toBe(100)
      expect(view.getFloat32()).toBeCloseTo(3.14, 2)
      expect(view.getInt32()).toBe(200)
      expect(view.byteOffset).toBe(12)
    })

    it('should handle mixed data types', () => {
      const testBuffer = new ArrayBuffer(20)
      const testView = new DataView(testBuffer)
      testView.setInt8(0, 42)
      testView.setInt16(1, 1000)
      testView.setInt32(3, 100000)
      testView.setFloat64(7, 2.718)
      testView.setUint8(15, 255)
      testView.setUint32(16, 4000000000)
      
      const view = new ProgressiveDataView(testBuffer)
      
      expect(view.getInt8()).toBe(42)
      expect(view.getInt16()).toBe(1000)
      expect(view.getInt32()).toBe(100000)
      expect(view.getFloat64()).toBeCloseTo(2.718, 3)
      expect(view.getUint8()).toBe(255)
      expect(view.getUint32()).toBe(4000000000)
    })
  })
})
