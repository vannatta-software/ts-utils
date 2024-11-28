import { StringUtils } from '../StringUtils'; // Adjust the import as needed

describe('StringUtils', () => {
  describe('className', () => {
    it('should return the class name for a class type', () => {
      class TestClass {}
      expect(StringUtils.className(TestClass)).toBe('TestClass');
    });

    it('should return the string itself if given a string', () => {
      expect(StringUtils.className('TestClass')).toBe('TestClass');
    });
  });

  describe('camelCase', () => {
    it('should convert string to camel case', () => {
      expect(StringUtils.camelCase('hello world')).toBe('helloWorld');
    });

    it('should handle empty string', () => {
      expect(StringUtils.camelCase('')).toBe('');
    });
  });

  describe('capitalize', () => {
    it('should capitalize the first letter', () => {
      expect(StringUtils.capitalize('hello')).toBe('Hello');
    });

    it('should handle empty string', () => {
      expect(StringUtils.capitalize('')).toBe('');
    });
  });

  describe('combine', () => {
    it('should join strings with a default space', () => {
      expect(StringUtils.combine(['Hello', 'world'])).toBe('Hello world');
    });

    it('should join strings with a custom delimiter', () => {
      expect(StringUtils.combine(['Hello', 'world'], '-')).toBe('Hello-world');
    });
  });

  describe('endsWith', () => {
    it('should return true if string ends with the given substring', () => {
      expect(StringUtils.endsWith('hello world', 'world')).toBe(true);
    });

    it('should return false if string does not end with the given substring', () => {
      expect(StringUtils.endsWith('hello world', 'worlds')).toBe(false);
    });
  });

  describe('finish', () => {
    it('should add finish string if not present', () => {
      expect(StringUtils.finish('hello', ' world')).toBe('hello world');
    });

    it('should not add finish string if already present', () => {
      expect(StringUtils.finish('hello world', ' world')).toBe('hello world');
    });
  });

  describe('lorem', () => {
    it('should generate lorem ipsum text with the specified length', () => {
      const result = StringUtils.lorem(20).split(" ");
      expect(result.length).toBeLessThanOrEqual(20);
    });
  });

  describe('kebabCase', () => {
    it('should convert string to kebab case', () => {
      expect(StringUtils.kebabCase('hello World Test')).toBe('hello-world-test');
    });

    it('should handle empty string', () => {
      expect(StringUtils.kebabCase('')).toBe('');
    });
  });

  describe('limit', () => {
    it('should limit string to the given length', () => {
      expect(StringUtils.limit('hello world', 5)).toBe('hello');
    });

    it('should append the given string if length exceeds', () => {
      expect(StringUtils.limit('hello world', 5, '...')).toBe('hello...');
    });
  });

  describe('random', () => {
    it('should generate a random string of specified length', () => {
      const randomString = StringUtils.random(10);
      expect(randomString.length).toBe(10);
    });
  });

  describe('replaceArray', () => {
    it('should replace multiple occurrences of characters', () => {
      expect(StringUtils.replaceArray('a', ['b', 'c'], 'abacadae')).toBe('bbccadae');
    });
  });

  describe('replaceFirst', () => {
    it('should replace the first occurrence of the character', () => {
      expect(StringUtils.replaceFirst('a', 'z', 'abacadae')).toBe('zbacadae');
    });
  });

  describe('replaceLast', () => {
    it('should replace the last occurrence of the character', () => {
      expect(StringUtils.replaceLast('a', 'z', 'abacadae')).toBe('abacadz');
    });
  });

  describe('removeSlug', () => {
    it('should remove slug from the string', () => {
      expect(StringUtils.removeSlug('hello-world', '-')).toBe('Hello World');
    });
  });

  describe('singular', () => {
    it('should convert string to singular', () => {
      expect(StringUtils.singular('cats')).toBe('cat');
    });
  });

  describe('slug', () => {
    it('should convert string to slug', () => {
      expect(StringUtils.slug('Hello World')).toBe('hello-world');
    });
  });

  describe('snake', () => {
    it('should convert string to snake_case', () => {
      expect(StringUtils.snake('Hello World')).toBe('hello_world');
    });
  });

  describe('studly', () => {
    it('should convert string to StudlyCase', () => {
      expect(StringUtils.studly('hello world')).toBe('HelloWorld');
    });
  });

  describe('startsWith', () => {
    it('should return true if string starts with the given substring', () => {
      expect(StringUtils.startsWith('hello world', 'hello')).toBe(true);
    });

    it('should return false if string does not start with the given substring', () => {
      expect(StringUtils.startsWith('hello world', 'world')).toBe(false);
    });
  });

  describe('start', () => {
    it('should add start string if not present', () => {
      expect(StringUtils.start('world', 'hello ')).toBe('hello world');
    });

    it('should not add start string if already present', () => {
      expect(StringUtils.start('hello world', 'hello ')).toBe('hello world');
    });
  });

  describe('titleCase', () => {
    it('should convert string to title case', () => {
      expect(StringUtils.titleCase('hello world')).toBe('Hello World');
    });
  });

  describe('urlSafe', () => {
    it('should return a URL-safe string', () => {
      expect(StringUtils.urlSafe('Hello World')).toBe('hello_world');
    });
  });

  describe('fromUrl', () => {
    it('should decode URL-safe string', () => {
      expect(StringUtils.fromUrl('hello_world')).toBe('hello world');
    });
  });

  describe('UUID', () => {
    it('should generate a UUID', () => {
      const uuid = StringUtils.UUID();
      expect(uuid).toMatch(/[a-f0-9-]{36}/);
    });
  });

  describe('reverse', () => {
    it('should reverse the string', () => {
      expect(StringUtils.reverse('hello')).toBe('olleh');
    });
  });

  describe('isPalindrome', () => {
    it('should check if the string is a palindrome', () => {
      expect(StringUtils.isPalindrome('madam')).toBe(true);
      expect(StringUtils.isPalindrome('hello')).toBe(false);
    });
  });
});
