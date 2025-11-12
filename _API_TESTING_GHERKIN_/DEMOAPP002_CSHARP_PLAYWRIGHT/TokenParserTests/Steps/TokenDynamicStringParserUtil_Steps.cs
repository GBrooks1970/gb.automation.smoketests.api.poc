using NUnit.Framework;
using System;
using System.Collections.Generic;
using System.Text.RegularExpressions;
using TechTalk.SpecFlow;
using TokenParserAPI.utils;

namespace TokenParserTests.Steps
{
    [Binding]
    public class TokenDynamicStringParserUtil_Steps
    {
        private readonly TokenDynamicStringParser _parser = new();
        private string _token = string.Empty;
        private string? _generated;
        private Exception? _exception;

        [Given(@"a token ""(.*)""")]
        public void GivenAToken(string token)
        {
            _token = token;
        }

        [When(@"I parse and generate the string")]
        public void WhenIParseAndGenerateTheString()
        {
            _generated = null;
            _exception = null;

            try
            {
                _generated = _parser.ParseToken(_token);
            }
            catch (Exception ex)
            {
                _exception = ex;
            }
        }

        [Then(@"the generated string should have a length of (.*)")]
        public void ThenTheGeneratedStringShouldHaveALengthOf(int expectedLength)
        {
            EnsureSuccess();
            var sanitized = _generated!.Replace("\r\n", string.Empty);
            Assert.That(sanitized.Length, Is.EqualTo(expectedLength));
        }

        [Then(@"the generated string should match the character set ""(.*)""")]
        public void ThenTheGeneratedStringShouldMatchTheCharacterSet(string characterSet)
        {
            EnsureSuccess();
            var regexPattern = characterSet switch
            {
                "ALPHA" => @"^[A-Za-z\r\n]+$",
                "NUMERIC" => @"^[0-9\r\n]+$",
                "ALPHA_NUMERIC" => @"^[A-Za-z0-9\r\n]+$",
                "ALPHA_NUMERIC_PUNCTUATION" => @"^[A-Za-z0-9\.\,\!\?\;\:\r\n]+$",
                "SPECIAL" => @"^[\!\@\#\$\%\^\&\*\(\)_\+\[\]\{\}\|\;\:\,\.\<\>\?\r\n]+$",
                "ALPHA_PUNCTUATION" => @"^[A-Za-z\.\,\!\?\;\:\r\n]+$",
                "PUNCTUATION" => @"^[\.\,\!\?\;\:\r\n]+$",
                "SPECIAL_PUNCTUATION" => @"^[\!\@\#\$\%\^\&\*\(\)_\+\[\]\{\}\|\;\:\,\.\<\>\?\.\,\!\?\;\:\r\n]+$",
                "ALPHA_NUMERIC_SPECIAL" => @"^[A-Za-z0-9\!\@\#\$\%\^\&\*\(\)_\+\[\]\{\}\|\;\:\,\.\<\>\?\r\n]+$",
                _ => throw new ArgumentException($"Unknown character set '{characterSet}'")
            };

            Assert.That(Regex.IsMatch(_generated!, regexPattern), $"Generated string '{_generated}' does not match character set {characterSet}");
        }

        [Then(@"the generated string should have (.*) lines")]
        public void ThenTheGeneratedStringShouldHaveLines(int expectedLines)
        {
            EnsureSuccess();
            var lines = _generated!.Split(new[] { "\r\n" }, StringSplitOptions.None);
            Assert.That(lines.Length, Is.EqualTo(expectedLines));
        }

        [Then(@"a dynamic string parser error should be thrown with message ""(.*)""")]
        public void ThenADynamicStringParserErrorShouldBeThrownWithMessage(string expectedMessage)
        {
            Assert.That(_exception, Is.Not.Null, "Expected parsing to throw an exception.");
            Assert.That(_exception!.Message, Does.Contain(expectedMessage));
        }

        private void EnsureSuccess()
        {
            Assert.That(_exception, Is.Null, () => $"Unexpected exception: {_exception}");
            Assert.That(_generated, Is.Not.Null, "Parser did not return a string.");
        }
    }
}
