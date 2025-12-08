+++
title = "Why do we use header files?"
date = 2025-11-30
[taxonomies]
tags = ["c", "low-level", "linker"]
+++

Hey everyone. Today I want to talk a little bit about **H**eader **F**iles in C and the Linker. I feel like this is a topic that doesn't get touched on enough.

In my case, back when I was at university, they explained everything there was to know about compilers, but they never really talked **about** the linker or the linking process—and I think it's actually quite important. So, today I'm going to explain how it works.

## The Problem: Compiler vs. Linker Errors

To start, let's look at a very simple C program. I have two integer variables and a function that is supposed to sum them up and print the result.

```c
#include <stdio.h>

int main() {
    int a = 3;
    int b = 2;
    int result = add(a, b);
    printf("Result is %d\n", result);
}
````

If you put this code into your IDE, and you have a LSP configured, it is probably screaming at you (Spoilers\!). If I try to compile this, I get an error:

```text
rafa at archdesktop ➜  math gcc main.c -o main
main.c: In function ‘main’:
main.c:6:18: error: implicit declaration of function ‘add’ [-Wimplicit-function-declaration]
    6 |     int result = add(a, b);
      |                  ^~~
```

{% note(title="Did you know?", type="info") %}
In older versions of compilers (or the C standard—I'm not sure which—), this used to be just a warning. The reason is that implicit function declarations were allowed, and assummed a default return type of `int`. You had to manually pass a flag to GCC to treat it as an error.
{% end %}

The error happens because when the compiler encounters a function call, it needs to know:

1. The size and type of the parameters.
2. The size and type of the return value.

The assembly code the compiler generates depends entirely on these factors. Since I'm calling a function `add` and the compiler has no idea about those details yet, it fails.

To fix this, we can use a **forward declaration**. We write the function signature so the compiler has enough information to proceed.

```c
#include <stdio.h>

extern int add(int a, int b);

int main() {
    int a = 3;
    int b = 2;
    int result = add(a, b);
    printf("Result is %d\n", result);
}
```


{% note(title="Quick tip!", type="tip") %}
You don't actually need to write the parameter names in the declaration, just the types. But almost everyone keeps the names for readability. You don't need to write `extern` either, since function declarations on C are considered `extern` by default.
{% end %}

If I save and compile again, the error changes. Now, it looks different. This is a **Linker Error**.

```text
rafa at archdesktop ➜  math gcc main.c -o main
/usr/sbin/ld: /tmp/ccx7N6qV.o: in function `main':
main.c:(.text+0x21): undefined reference to `add'
collect2: error: ld returned 1 exit status
```

## How Compilation Works (The Deep Dive)

When we invoke `gcc`, we aren't just calling the compiler. There are several phases required to transform high-level code into machine code:

 {% mermaid() %}
flowchart LR

    %% Main Flow
    Start(.c) --> Preproc
    Preproc -- .i --> Compiler
    Compiler -- .asm --> Assembler
    Assembler -- .o --> Linker
    Linker --> End(elf <br/> ./main)

    %% Nodes with descriptions to match the drawing
    Preproc[<b>Preproc</b><br/>--------------<br/>#include<br/>#define]
    Compiler[<b>Compiler</b><br/>--------------<br/>add eax, ecx<br/>push edx]
    Assembler[<b>Assembler</b>]
    Linker[<b>Linker</b>]


    %% External Object files merging into Linker (as drawn in the top right)
    Obj1(.o) --> Linker
    Obj2(.o) --> Linker

    %% Styling for better visibility
    style Preproc fill:#000,stroke:#fff,stroke-width:2px,color:#fff
    style Compiler fill:#000,stroke:#fff,stroke-width:2px,color:#fff
    style Assembler fill:#000,stroke:#fff,stroke-width:2px,color:#fff
    style Linker fill:#000,stroke:#fff,stroke-width:2px,color:#fff
    style Start fill:#000,stroke:#fff,color:#fff
    style End fill:#000,stroke:#fff,color:#fff
    style Obj1 fill:#000,stroke:#fff,color:#fff
    style Obj2 fill:#000,stroke:#fff,color:#fff
{% end %} 

1. **The Preprocessor:** It takes your source code and handles instructions starting with `#` (like `#include`, `#define`). It processes macros and substitutes text.
2. **The Compiler:** It takes the output of the preprocessor and translates high-level C into Assembly code (instructions like `mov`, `push`, etc.).
3. **The Assembler:** It takes that Assembly code and translates it into machine code specific to your architecture, spitting out an **Object File** (`.o`).
4. **The Linker:** Finally, the linker takes these object files—along with external libraries—and produces the final executable (in the case of Linux, an `ELF` file).

### The Linker's Job

The Linker has two main responsibilities:

1. **Ordering:** It decides how to arrange the code from various object files into the final executable by following a *linker script*.
2. **Symbol Resolution:** This is why our previous error changed.

A **symbol** is essentially a name we give to a region of memory (like variable names `a`, `b`, or function names `add`, `printf`).

In our code, we *declared* `add` (we told the compiler it exists), but we never *defined* it (we never implemented the body of the function). When we use `extern` (or just a declaration), we are making a promise to the compiler: *"Don't worry, the Linker will find the implementation of this function later."*

The Linker's job is to find the memory address where that function lives and patch the function call with that address. Since we didn't implement it, the Linker complains.

## Peeking Inside an Object File

Here is something curious that helps visualize this. We can pass the `-c` flag to GCC. This tells it to compile and assemble, but **skip the linking step**.

```bash
gcc -c main.c
```

This outputs a `.o` file. If we run the `file` command on it, it says it is a **relocatable** file. You cannot execute this directly because it isn't finished yet.

If we look at the assembly using `objdump`, we see something interesting in the `main` function:

{% note(title="Quick tip!", type="tip") %}
You can use the `-M` flag to tell `objdump` to use the Intel syntax, which I believe it's easier on the eyes, like so: `-M intel`
{% end %}

```asm
0000000000000000 <main>:
   0:    55                       push   rbp
   1:    48 89 e5                 mov    rbp,rsp
    ...
  20:    e8 00 00 00 00           call   25 <main+0x25>
  25:    89 45 fc                 mov    DWORD PTR [rbp-0x4],eax
  28:    8b 45 fc                 mov    eax,DWORD PTR [rbp-0x4]
    ...
  37:    b8 00 00 00 00           mov    eax,0x0
  3c:    e8 00 00 00 00           call   41 <main+0x41>
  41:    b8 00 00 00 00           mov    eax,0x0
  46:    c9                       leave
  47:    c3                       ret
```

**Take a** look at instruction `20` and `3c`. Notice how the opcode for `call` is there, but the address is all **zeros**. It's a placeholder. The compiler left it blank for the Linker to fill in later.

## Fixing the Link

To fix this, we need to define `add`. Let's say we define it in a separate file, `math.c`.

```c
// math.c
int add(int a , int b) {
    return a + b;
}
```

Now, we tell GCC to compile both files:

```bash
gcc main.c math.c
```

The linker now finds the symbol `add` in `math.c`, resolves the address, and links them together. If we inspect the final executable again, **the** call instructions **will** now have **real memory addresses**:

```asm
0000000000001139 <main>:
    ...
    1155:    89 d6                    mov    esi,edx
    1157:    89 c7                    mov    edi,eax
    1159:    e8 23 00 00 00           call   1181 <add>
    115e:    89 45 fc                 mov    DWORD PTR [rbp-0x4],eax
    1161:    8b 45 fc                 mov    eax,DWORD PTR [rbp-0x4]
    ...
    1170:    b8 00 00 00 00           mov    eax,0x0
    1175:    e8 b6 fe ff ff           call   1030 <printf@plt>
    117a:    b8 00 00 00 00           mov    eax,0x0
    117f:    c9                       leave
    1180:    c3                       ret

0000000000001181 <add>:
    1181:    55                       push   rbp
    1182:    48 89 e5                 mov    rbp,rsp
    1185:    89 7d fc                 mov    DWORD PTR [rbp-0x4],edi
    1188:    89 75 f8                 mov    DWORD PTR [rbp-0x8],esi
    118b:    8b 55 fc                 mov    edx,DWORD PTR [rbp-0x4]
    118e:    8b 45 f8                 mov    eax,DWORD PTR [rbp-0x8]
    1191:    01 d0                    add    eax,edx
    1193:    5d                       pop    rbp
    1194:    c3                       ret
```

{% note(title="Note", type="info") %}
This example uses static linking (notice how the code for `add` was copied into the executable). Functions like `printf` usually use dynamic linking (loading code at runtime), but that's a complex topic for another post.
{% end %}

## Enter: Header Files

If we had a library with dozens of functions, writing manual forward declarations for every single one in `main.c` would be a nightmare. It takes up space and is hard to manage.

This is why **Header Files** were invented. We move those declarations into their own file (`math.h`).

```c
// math.h
#ifndef _MATH_H
#define _MATH_H

int add(int a, int b);

#endif
```

Now, in `main.c`, we replace the manual declarations with:

```c
// main.c
#include "math.h"
```

The `#include` directive effectively tells the preprocessor: *"Go to this file, copy all its contents, and paste them right here."* To the compiler, it looks exactly the same as if you **had** typed it manually.

{% note(title="Note", type="info") %}
The `ifndef` and `define` instructions are part of what's called a **Header Guard**. It's just there to avoid including a header file more than once into a file.
{% end %}

### The "Type Mismatch" Trap

Here is a common way to shoot yourself in the foot in C.

Imagine I go to the definition of `add` in `math.c` and change the parameters from `int` to `float`, but I forget to update the header file.

If I compile this, **it will work**, but the result will be garbage (e.g., saying 3 + 4 = 0).

Why is that?

1. `main.c` relies on the header file. It thinks `add` takes integers, so it sets up the assembly to pass integers.
2. `math.c` expects floats. It interprets those bits as floating-point numbers (which use IEEE 754, totally different from integer representation).

To prevent this, **always include the header file in the implementation file (`math.c`) as well.**

```c
// math.c
#include "math.h" 

int add(int a , int b) {
    return a + b;
}
```

Now, if the types don't match, the compiler and your LSP will catch the conflict and give you an error.

### Includes: `< >` vs `" "`

You might wonder why we sometimes use quotes and sometimes angle brackets:

- `#include <stdio.h>`: Used for system libraries. The compiler searches in specific system directories (like `/usr/include`).
- `#include "math.h"`: Used for your own files. The compiler searches in the current directory first.

## Why Do We Still Use Header Files?

Modern languages like Rust or Go don't need this separation. So why stick with it in C? Here are four reasons:

1.  **API Specification:** If you are using a closed-source library, the header file serves as your documentation. It tells you exactly what functions are available and how to call them without you needing to see the code.
2.  **Private Functions:** You can implement helper functions in your `.c` file but *not* declare them in the `.h` file. This effectively makes them "private" to that file, invisible to the user of your library.
3.  **Maintainability:** If you change a function signature, you update the header file once, and that change propagates to every file that includes it.
4.  **Opaque Structs:** You can declare a `struct` in a header but define its contents in the `.c` file. This prevents users from manually messing with the struct's internal fields, making your library safer and more robust. Take a look at this struct, for example:

```c
typedef struct _Text {
    char *str;
    int length;
    int counter;
} *Text;
```

This is code for a [library I wrote](https://gitlab.com/rinuxu/text) that provided a wrapper API over C strings to emulate how modern languages do string handling. The point is that instead of having this struct declared and defined **in** the header file, I can **leave** the `typedef` on the header file, and move the actual definition to the `.c` file:

```c
// text.h
typedef struct _Text *Text;

// text.c
struct _Text {
  char *str;
  int length;
  int counter;
};
```

## The Historical Reason

Finally, why doesn't C just handle this automatically like modern languages?

C was created a long time ago when computers had extremely limited memory. The compiler couldn't hold the information for the entire project in memory at once. It had to treat every `.c` file as an individual, isolated **Translation Unit**.


{% note(title="Note", type="info") %}
A Translation Unit is the result of running the preprocessor on one .c file. That means all included headers become part of that TU.
{% end %}

The compiler doesn't know about other files; it only knows what's in the current file. That's why we, the programmers, have to provide header files to "bridge the gap" and promise the compiler that the symbols will exist later during linking.

