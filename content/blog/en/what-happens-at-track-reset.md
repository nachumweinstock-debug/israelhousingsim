---
title: "What Actually Happens at a Track Reset"
description: "Fixed rate" and "reset" sound contradictory, and that confusion trips up first-time buyers. What really happens when a reset-eligible track reprices.
date: 2026-07-17
tags: track reset, prime, variable rate, payment change
---

"Fixed rate" and "reset" seem like they shouldn't both apply to the same loan, and that's exactly the confusion that trips people up. The two concepts apply to different tracks, and understanding the difference matters more than almost any other single thing when you're choosing your mix.

## Prime resets constantly, by design

A prime-linked track isn't really "reset" in the sense of a scheduled event, it simply floats continuously with the Bank of Israel's prime lending rate. When the central bank moves its base rate, your prime-track payment adjusts within the same billing cycle or shortly after, every time, for the life of that track. There's no fixed schedule because there's no fixed rate to begin with. If you want the mechanics of why this track exists at all, see our [explainer on the three tracks](/blog/prime-kalatz-katz-tracks-explained).

## Some fixed tracks reset too, on a schedule

Separately from prime, some loan tracks are structured as fixed for a defined interval, five years is common, and then reprice to a new rate for the next interval, repeating for the life of the loan. This is a different animal from kalatz or katz, which are fixed (or CPI-linked and fixed-rate) for the entire term with no reset at all. A reset-eligible fixed track gives you rate certainty for a stretch of years, then exposes you to whatever rates look like at that point, repeating.

## What actually changes at the reset date

At the reset, the bank recalculates your payment based on three things: your actual remaining balance at that point (not the original loan amount), the remaining months left on your term, and the new rate being applied for the next interval. That new rate reflects market conditions at the reset date, which could be higher or lower than what you started with, there's no guarantee either direction.

If the track was CPI-linked, there's a fourth factor: the balance itself has been growing with inflation since you took the loan, so the "remaining balance" being reset isn't just what a normal amortization schedule would show, it's that balance further inflated by however much the CPI has moved over the interval. This is the same mechanism covered in our [prime, kalatz, katz explainer](/blog/prime-kalatz-katz-tracks-explained): the rate can stay flat while the balance underneath it grows, and a reset recalculates the payment against that larger, inflated balance.

## Why the payment can jump even if rates haven't moved much

Because a reset recalculates against the *remaining* term, not a fresh full term, the payment math compresses. Even a modest rate change can produce a more noticeable payment shift than the same rate change would on a brand new, full-length loan, simply because there are fewer months left to spread the balance across. This is one of the more counterintuitive parts of reset-eligible tracks: a small move in rates plus a shorter remaining runway can add up to a bigger jump than people expect.

## How to avoid being surprised by it

Two things help. First, when you're shown a payment quote for a reset-eligible track, ask specifically what the payment looks like at the next reset under a plausible rate move, not just today's payment, the same "payment today versus stressed payment" comparison worth applying to prime. Second, know your reset date and put it on your own calendar, rather than waiting for the bank to notify you, since your monthly budget is going to shift on that date whether or not you were tracking it.

## Frequently asked questions

### What actually happens to my payment when a track resets?

The bank recalculates your payment based on your actual remaining balance at that point, the months left on your term, and the new rate being applied for the next interval. That new rate reflects market conditions at the reset date, higher or lower, with no guarantee either way.

### Does a prime track "reset" the same way a fixed track does?

No. A prime-linked track isn't reset on a schedule, it simply floats continuously with the Bank of Israel's prime lending rate, adjusting within the same billing cycle or shortly after every time the base rate moves.

### Why can a small rate change cause a big payment jump at reset?

Because a reset recalculates against the remaining term, not a fresh full term. With fewer months left to spread the balance across, even a modest rate change can produce a more noticeable payment shift than the same change would on a brand-new loan.

## Model a reset before it happens

The [VryfID simulator](/simulator/welcome) shows your payment today alongside an estimated payment at year ten, factoring in resets and CPI drift across your actual mix, so a reset doesn't arrive as a surprise.
