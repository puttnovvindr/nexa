"use client"

import { useState } from "react"

export function useMultiStepForm(totalSteps: number, validateStep?: (step: number) => boolean) {
  const [activeStep, setActiveStep] = useState(0)
  const [touched, setTouched] = useState(false)

  const nextStep = () => {
    setTouched(true)
    if (validateStep && !validateStep(activeStep)) {
      return false
    }
    if (activeStep < totalSteps - 1) {
      setActiveStep((prev) => prev + 1)
      setTouched(false)
      return true
    }
    return false
  }

  const prevStep = () => {
    if (activeStep > 0) {
      setActiveStep((prev) => prev - 1)
      setTouched(false)
    }
  }

  const goToStep = (stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < totalSteps) {
      setActiveStep(stepIndex)
    }
  }

  return {
    activeStep,
    setActiveStep,
    touched,
    setTouched,
    nextStep,
    prevStep,
    goToStep,
    isFirstStep: activeStep === 0,
    isLastStep: activeStep === totalSteps - 1,
  }
}