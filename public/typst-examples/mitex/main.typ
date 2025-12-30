#import "@preview/mitex:0.2.6": *

= Intro
Packages from the Typst Universe like Mitex are not in separate files. They come bundled with the compiler, but we need to import them.

This package called Mitex is super useful for using LaTeX code inside a Typst document.

= Mitex  example



#assert.eq(mitex-convert("\alpha x"), "alpha  x ")

Write inline equations like #mi("x") or #mi[y].

Also block equations (this case is from #text(blue.lighten(20%), link("https://katex.org/")[katex.org])):

#mitex(`
  \newcommand{\f}[2]{#1f(#2)}
  \f\relax{x} = \int_{-\infty}^\infty
    \f\hat\xi\,e^{2 \pi i \xi x}
    \,d\xi
`)

We also support text mode (in development):

#mitext(`
  \iftypst
    #set math.equation(numbering: "(1)", supplement: "equation")
  \fi

  \subsection{Title}

  A \textbf{strong} text, a \emph{emph} text and inline equation $x + y$.

  Also block \eqref{eq:pythagoras}.

  \begin{equation}
    a^2 + b^2 = c^2 \label{eq:pythagoras}
  \end{equation}
`)

And everything you can imagine...

= More examples!

#mitex(`
\lim_{x \to \infty}a_n\qquad
\frac{d}{dt}\qquad
\ddot{x}\qquad
\frac{\partial^2}{\partial x^2}\qquad
\sum_{i=1}^na_i\qquad
\int_a^bf(t)dt\qquad
\oint_C \vec{F} \cdot \overrightarrow{d r}
`)

#mitex(`
\underbrace{1-e^0}_{0}+6
\qquad\qquad
\overbrace{
\frac{\partial f}{\partial x}
\dot{x}+\frac{\partial f}{\partial y}\dot{y}
+\frac{\partial f}{\partial t}
}^{\frac{df}{dt}}=0
\qquad\quad
\underbrace{a+a+a}_{
\substack{
\text{1st line of text} \\ 
\text{2nd line of text}
}
}
`)


#mitex(`
\begin{pmatrix}
a_{11}&a_{12}&a_{13}\\
a_{21}&a_{22}&a_{23}\\
a_{31}&a_{32}&a_{33}
\end{pmatrix}

\qquad \quad

\begin{bmatrix}
v_1\\
v_2\\
v_3
\end{bmatrix}

\qquad \quad

\begin{vmatrix}
\textbf{i}&\textbf{j}&\textbf{k}\\
v_1&v_2&v_3\\
u_1&u_2&u_3
\end{vmatrix}



`)

#mitex(`
f(x,y)=
\begin{cases}
\frac{x \sin (x^2+y^2)}{x^2+y^2} & \text {if}(x,y)\neq(0,0)
\\
0 & \text {if}(x,y)=(0,0)
\end{cases}

`)