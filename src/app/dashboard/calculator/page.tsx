'use client'

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calculator as CalculatorIcon, History } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

// A simple, safe-to-use expression evaluator
function safeEval(expr: string): number | null {
    if (expr.length > 200) {
      console.error("Expression too long.");
      return null;
    }
    // Remove any characters that are not digits, operators, or dots.
    const sanitizedExpr = expr.replace(/[^0-9+\-*/().%eπ]/g, '');
    
    // Replace constants and functions
    const withMath = sanitizedExpr
        .replace(/π/g, '(3.141592653589793)')
        .replace(/e/g, '(2.718281828459045)')

    try {
        // Use a Function constructor to evaluate the expression in a sandboxed way.
        const result = new Function(`return ${withMath}`)();
        if (result === Infinity || result === -Infinity || isNaN(result)) {
            return null;
        }
        return result;
    } catch (error) {
        console.error("Evaluation Error:", error);
        return null;
    }
}


export default function CalculatorPage() {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [isResult, setIsResult] = useState(false);
  const [mode, setMode] = useState<'scientific' | 'normal'>('scientific');

  const handleButtonClick = (value: string) => {
    if (value === 'AC') {
      setDisplay('0');
      setExpression('');
      setIsResult(false);
    } else if (value === '=') {
      if (!expression) return;
      try {
        let exprToEval = expression;
        const lastChar = expression.slice(-1);
        if (['+', '-', '*', '/'].includes(lastChar)) {
            exprToEval = expression.slice(0, -1);
        }
        
        const currentExpression = exprToEval.replace(/%/g, '/100');
        const result = safeEval(currentExpression);
        
        if (result === null) {
            setDisplay('Error');
            setExpression('');
            setIsResult(true);
            return;
        }

        const finalResult = String(result);
        setHistory(prev => [`${expression} = ${finalResult}`, ...prev].slice(0, 50));
        setDisplay(finalResult);
        setExpression(finalResult);
        setIsResult(true);
      } catch (error) {
        setDisplay('Error');
        setExpression('');
        setIsResult(true);
      }
    } else if (value === '+/-') {
        if (display !== 'Error' && display !== '0') {
            const currentNumberStr = display;
            const negatedValue = String(parseFloat(currentNumberStr) * -1);
            
            setDisplay(negatedValue);

            // More robustly replace the last occurrence of the number in the expression
            const reverseExpr = expression.split('').reverse().join('');
            const reverseNum = currentNumberStr.split('').reverse().join('');

            if (reverseExpr.startsWith(reverseNum)) {
                const newExpr = reverseExpr.replace(reverseNum, negatedValue.split('').reverse().join('')).split('').reverse().join('');
                setExpression(newExpr);
            } else {
                // If display was the result of a scientific function, start a new expression
                setExpression(negatedValue);
            }
            setIsResult(false);
        }
    } else if (['sin', 'cos', 'tan', 'log', 'ln', '√'].includes(value)) {
        handleScientific(value);
    } else if (['π', 'e'].includes(value)) {
        handleConstant(value);
    } else if (['+', '-', '*', '/', '%'].includes(value)) {
        if (expression === '' && display === '0') return;
        if (display === 'Error') {
            setExpression('');
            setDisplay('0');
            return;
        }
        // Prevent adding operator if the last char is already an operator
        const lastChar = expression.slice(-1);
        if (['+', '-', '*', '/', '%'].includes(lastChar)) {
            // Replace the last operator
            setExpression(expression.slice(0, -1) + value);
            return;
        };

        setExpression(expression + value);
        setIsResult(false);
    }
    else {
      // If last operation resulted in error, or it is a result, start new expression
      if (display === 'Error' || isResult) {
        setDisplay(value);
        setExpression(value);
        setIsResult(false);
        return;
      }
      
      const lastChar = expression.slice(-1);
      // If the last input was a constant or a closed parenthesis, user must add an operator first
      if (['π', 'e', ')'].includes(lastChar) && value !== '.') {
          return;
      }

      // If the display is '0', start a new number
      if (display === '0' && value !== '.') {
          setDisplay(value);
      } else {
          // If previous input was an operator, reset display
          if(['+', '-', '*', '/', '%'].includes(lastChar)) {
            setDisplay(value);
          } else {
            setDisplay(display + value);
          }
      }
      setExpression(expression + value);
    }
  };
  
  const handleConstant = (constant: 'π' | 'e') => {
      const strValue = constant;
      if (isResult || display === '0' || display === 'Error') {
        setDisplay(strValue);
        setExpression(strValue);
      } else {
        const lastChar = expression.slice(-1);
        if(['+', '-', '*', '/', '%', '('].includes(lastChar) || expression === ''){
            setDisplay(strValue);
            setExpression(expression + strValue);
        } else {
            // Must have an operator between numbers/constants
            return;
        }
      }
      setIsResult(false);
  };
  
  const handleScientific = (func: string) => {
      let result;
      const currentVal = parseFloat(display);
      if (isNaN(currentVal)) {
          setDisplay("Error");
          setExpression("");
          setIsResult(true);
          return;
      }
      try {
          switch(func) {
              case 'sin': result = Math.sin(currentVal); break;
              case 'cos': result = Math.cos(currentVal); break;
              case 'tan': result = Math.tan(currentVal); break;
              case 'log': result = currentVal > 0 ? Math.log10(currentVal) : null; break;
              case 'ln': result = currentVal > 0 ? Math.log(currentVal) : null; break;
              case '√': result = currentVal >= 0 ? Math.sqrt(currentVal) : null; break;
              default: result = null;
          }
           if (result === null || isNaN(result as number) || !isFinite(result as number)) {
                setDisplay('Error');
                setExpression('');
                setIsResult(true);
                return;
            }
          const finalResult = String(Number((result as number).toFixed(10)));
          setHistory(prev => [`${func}(${display}) = ${finalResult}`, ...prev.slice(0, 49)]);
          setDisplay(finalResult);
          setExpression(finalResult); // Set expression to the result to allow chaining
          setIsResult(true);
      } catch {
          setDisplay("Error");
          setExpression("");
          setIsResult(true);
      }
  }
  
  const basicButtons = [
    'AC', '+/-', '%', '/',
    '7', '8', '9', '*',
    '4', '5', '6', '-',
    '1', '2', '3', '+',
    '0', '.', '=',
  ];

  const scientificButtons = [
    'sin', 'cos', 'tan', 'log',
    'ln', '√', 'π', 'e',
  ]

  const buttons = mode === 'scientific' ? [...scientificButtons, ...basicButtons] : basicButtons;
  
  const getVariant = (btn: string) => {
    if (['/', '*', '-', '+', '='].includes(btn)) return 'default';
    if (['AC', '+/-', '%'].includes(btn) || ['sin', 'cos', 'tan', 'log', 'ln', '√', 'π', 'e'].includes(btn)) return 'secondary';
    return 'outline';
  }


  return (
    <div className="grid md:grid-cols-[1fr_280px] gap-6 items-start">
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 mb-2">
                        <CalculatorIcon className="h-6 w-6 text-primary" />
                        <CardTitle className="font-headline">Calculadora</CardTitle>
                    </div>
                    <RadioGroup
                        value={mode}
                        onValueChange={(value: 'scientific' | 'normal') => setMode(value)}
                        className="flex items-center space-x-4"
                    >
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="normal" id="r1" />
                            <Label htmlFor="r1">Normal</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="scientific" id="r2" />
                            <Label htmlFor="r2">Científica</Label>
                        </div>
                    </RadioGroup>
                </div>
                <CardDescription>Realiza desde cálculos básicos hasta funciones científicas complejas.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="bg-muted rounded-lg p-4 text-right text-4xl font-mono mb-4 overflow-x-auto break-all">
                    {display}
                </div>
                <div className={`grid gap-2 ${mode === 'scientific' ? 'grid-cols-4' : 'grid-cols-4'}`}>
                    {buttons.map((btn) => (
                    <Button key={btn} variant={getVariant(btn)} className={`text-lg p-6 ${btn === '0' ? 'col-span-2' : ''} ${btn === '=' ? 'bg-primary hover:bg-primary/90' : ''}`} onClick={() => handleButtonClick(btn)}>
                        {btn}
                    </Button>
                    ))}
                </div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <History className="h-5 w-5 text-primary" />
                    <CardTitle className="font-headline text-xl">Historial</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                {history.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">No hay cálculos aún.</p>
                ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {history.map((item, index) => (
                            <div key={index} className="text-sm text-muted-foreground break-words">{item}</div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    </div>
  );
}
