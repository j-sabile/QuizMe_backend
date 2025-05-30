import { generateQuestions } from "./llm/awan.js";

const text = `
Module 1: Introduction to Programming

Programming is the process of giving a computer a set of instructions to perform tasks. A programming language is a formal language that specifies a set of instructions that can be used to produce various kinds of output. Common programming languages include Python, Java, C, and JavaScript.

There are two main types of language translators:

A compiler translates the entire program into machine code before execution.

An interpreter translates code line by line at runtime.

A development environment includes tools like a text editor or IDE (Integrated Development Environment), terminal or command-line interface, and compilers or interpreters.

Module 2: Basic Syntax and Structure

A program is made up of statements written according to the rules of a programming language. Most languages require a specific syntax including proper use of punctuation, indentation, and keywords.

Key elements include:

Comments: Used to explain code, ignored by the compiler/interpreter.

Statements: Individual instructions in a program.

Blocks: Groups of code often defined by indentation or braces.

Example in Python:

python
Copy
Edit
# This is a comment
print("Hello, world!")
`;

generateQuestions(text, 2);
