#show link: underline
#show link: set text(fill: blue)

== Using Fonts

We can use the default font which is this one of this online editor, it is the IBM Plex Sans Regular font.

#text(font: "New Computer Modern")[
  == New Computer Modern
  We can also  use default built-in fonts like New Computer Modern, New Computer Modern Math, Libertinus Serif or DejaVu Sans Mono.
]

== Custom fonts
Finally we can upload our own `.otf` or `.ttf` files in the editor and use them.

=== Andropabe
#text(font: "Andropabe")[
This text should be Andropabe font.
 ]

=== Roboto
#text(font: "Roboto")[
This text should be Roboto Regular font.
 ]

=== Important note
This works kinda like a trick. Typst.ts does not support fonts after the compiler initialization so the trick is to reinitialize the compiler every time a .ttf or .otf file gets added.

Also as you can see, you don't use the path in the Typst document, you use the font name. You can check the font name in the metadata of the file. An example webiste for that is #link("https://fontdrop.info")[FontDrop].
