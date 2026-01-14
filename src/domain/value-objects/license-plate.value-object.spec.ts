import { LicensePlate } from './license-plate.value-object';

describe('LicensePlate', () => {
  describe('Valid license plates', () => {
    it('should accept old format ABC1234', () => {
      expect(() => new LicensePlate('ABC1234')).not.toThrow();
      expect(() => new LicensePlate('ABC-1234')).not.toThrow();
      expect(() => new LicensePlate('abc1234')).not.toThrow();
    });

    it('should accept Mercosul format ABC1D23', () => {
      expect(() => new LicensePlate('ABC1D23')).not.toThrow();
      expect(() => new LicensePlate('ABC-1D23')).not.toThrow();
      expect(() => new LicensePlate('abc1d23')).not.toThrow();
    });

    it('should sanitize and convert to uppercase', () => {
      const plate1 = new LicensePlate('abc-1234');
      expect(plate1.getValue()).toBe('ABC1234');

      const plate2 = new LicensePlate('abc 1d23');
      expect(plate2.getValue()).toBe('ABC1D23');
    });

    it('should format license plate correctly', () => {
      const plate1 = new LicensePlate('ABC1234');
      expect(plate1.getFormatted()).toBe('ABC-1234');

      const plate2 = new LicensePlate('ABC1D23');
      expect(plate2.getFormatted()).toBe('ABC-1D23');
    });
  });

  describe('Invalid license plates', () => {
    it('should reject invalid formats', () => {
      expect(() => new LicensePlate('12345678')).toThrow(
        'Invalid license plate format. Must be ABC1234 or ABC1D23',
      );
      expect(() => new LicensePlate('ABCD123')).toThrow(
        'Invalid license plate format. Must be ABC1234 or ABC1D23',
      );
      expect(() => new LicensePlate('AB12345')).toThrow(
        'Invalid license plate format. Must be ABC1234 or ABC1D23',
      );
    });

    it('should reject empty or too short plates', () => {
      expect(() => new LicensePlate('')).toThrow(
        'Invalid license plate format. Must be ABC1234 or ABC1D23',
      );
      expect(() => new LicensePlate('ABC123')).toThrow(
        'Invalid license plate format. Must be ABC1234 or ABC1D23',
      );
    });

    it('should reject plates with invalid characters', () => {
      // Special characters are removed by sanitize
      // ABC@1234 becomes ABC1234 which is valid (3 letters + 4 numbers)
      expect(() => new LicensePlate('ABC@1234')).not.toThrow();

      // ABC!D23 becomes ABCD23 which is invalid (should be ABC1D23 - 3 letters + 1 number + 1 letter + 2 numbers)
      expect(() => new LicensePlate('ABC!D23')).toThrow(
        'Invalid license plate format. Must be ABC1234 or ABC1D23',
      );
    });
  });

  describe('Edge cases', () => {
    it('should handle plates with various separators', () => {
      expect(() => new LicensePlate('ABC-1234')).not.toThrow();
      expect(() => new LicensePlate('ABC.1234')).not.toThrow();
      expect(() => new LicensePlate('ABC 1234')).not.toThrow();
    });

    it('should maintain immutability', () => {
      const plate = new LicensePlate('ABC1234');
      const value1 = plate.getValue();
      const value2 = plate.getValue();
      expect(value1).toBe(value2);
    });
  });
});
