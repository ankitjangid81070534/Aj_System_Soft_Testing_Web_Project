import { ArrowLeft, Bold, ChevronDown, ChevronRight, Italic, LayoutGrid, Moon, Palette, Receipt, Sun, Type, Underline } from "lucide-react";
import { Reveal } from "./Reveal";
import styles from "./juspay-demo.module.css";
import light from "./demo-light.module.css";

/** Live "ERP, CRM & Admin Panels" modules — sales, stock, accounts, reporting. */
const MODULES = ["Sales", "Inventory", "Accounts", "Reports", "Customers", "Staff & roles"];
const FONTS = ["DM Sans", "Inter", "Roboto"];

/**
 * "Checkout for every part of the world" → the same browser-frame builder
 * mockup: floating configuration panels (colour palette, font style, layout,
 * corner radius, button style) around a central branded screen. Here the
 * screen is an ERP sales invoice, the section the live "One team, every
 * platform" pitch.
 */
export function DemoBuilder() {
  return (
    <section id="experience" className={light.section}>
      <div className={styles.container}>
        <div className={light.splitHead}>
          <Reveal>
            <h2 className={light.h2}>
              Software for every part
              <br />
              of your <span className={styles.blue}>business</span>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className={light.lead}>
              Business systems that connect <strong>sales, stock, accounts and reporting</strong> in one manageable
              place — branded for you, without code changes for every tweak. Tell us the problem; we propose the right
              platform and architecture for it, not the other way around.
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.15}>
          <div className={light.browser} aria-hidden>
            <div className={light.browserBar}>
              <span />
              <span />
              <span />
            </div>
            <div className={light.canvas}>
              <span className={light.regionPill}>
                <i className={light.flagDot} /> India <ChevronDown size={14} />
              </span>
              <span className={light.themeToggle}>
                <Moon size={14} />
                <b>
                  <Sun size={14} />
                </b>
              </span>

              {/* left column */}
              <div className={`${light.panel} ${light.panelPalette}`}>
                <span className={light.panelTitle}>
                  <Palette size={16} /> Colour palette
                </span>
                <div className={light.swatches}>
                  <i style={{ background: "#3079ea" }} />
                  <i style={{ background: "#0a1a4a" }} />
                  <i style={{ background: "#e6e8ee" }} />
                  <i style={{ background: "#f6f7fa" }} />
                  <button type="button" tabIndex={-1}>
                    Generate
                  </button>
                </div>
              </div>
              <div className={`${light.panel} ${light.panelModules}`}>
                {MODULES.map((module) => (
                  <span key={module} className={light.moduleRow}>
                    <i className={light.toggle} /> {module} <ChevronRight size={12} />
                  </span>
                ))}
              </div>
              <div className={`${light.panel} ${light.panelType}`}>
                <div className={light.typeTools}>
                  <Bold size={14} />
                  <Italic size={14} />
                  <Type size={14} />
                  <Underline size={14} />
                </div>
              </div>
              <div className={`${light.panel} ${light.panelFont}`}>
                <span className={light.panelTitle}>
                  <Type size={16} /> Font style
                </span>
                {FONTS.map((font, index) => (
                  <span key={font} className={`${light.fontRow} ${index === 0 ? light.fontRowActive : ""}`}>
                    <i /> {font}
                  </span>
                ))}
                <span className={light.fontMore}>500+ fonts</span>
              </div>

              {/* centre screen */}
              <div className={light.screen}>
                <div className={light.screenHead}>
                  <ArrowLeft size={16} /> Sales invoice
                </div>
                <div className={light.screenRow}>
                  <Receipt size={16} /> <b>Invoice #1042</b>
                  <em>₹7,800</em>
                  <ChevronDown size={14} />
                </div>
                <div className={light.screenInput}>
                  <span>Enter customer or GSTIN</span>
                  <b>Apply</b>
                </div>
                <small className={light.screenLabel}>Items</small>
                <div className={light.screenItem}>
                  <span className={light.screenItemIcon} />
                  <div>
                    <b>Service plan · Annual</b>
                    <small>1 × ₹6,000</small>
                  </div>
                  <ChevronRight size={14} />
                </div>
                <div className={light.screenItem}>
                  <span className={`${light.screenItemIcon} ${light.screenItemIconAlt}`} />
                  <div>
                    <b>Android companion app</b>
                    <small>1 × ₹1,800</small>
                  </div>
                  <ChevronRight size={14} />
                </div>
                <small className={light.screenLabel}>Payment</small>
                <div className={light.screenItem}>
                  <span className={`${light.screenItemIcon} ${light.screenItemIconGreen}`} />
                  <div>
                    <b>UPI / Cards / Net banking</b>
                    <small>Collected at counter</small>
                  </div>
                  <ChevronRight size={14} />
                </div>
                <div className={light.screenFoot}>
                  <div>
                    <s>₹9,999</s>
                    <b>₹7,800</b>
                  </div>
                  <span className={light.screenPay}>Save &amp; print</span>
                </div>
              </div>

              {/* right column */}
              <div className={`${light.panel} ${light.panelLayout}`}>
                <span className={light.panelTitle}>
                  <LayoutGrid size={16} /> Choose your layout
                </span>
                <div className={light.layouts}>
                  <span className={light.layoutActive}>
                    <i />
                    <i />
                    <b>Stripes</b>
                    <i />
                  </span>
                  <span>
                    <i />
                    <i />
                    <i />
                  </span>
                  <span>
                    <i />
                    <i />
                    <i />
                  </span>
                </div>
              </div>
              <div className={`${light.panel} ${light.panelRadius}`}>
                <span className={light.panelTitle}>Corner radius</span>
                <span className={light.select}>
                  12px <ChevronDown size={12} />
                </span>
              </div>
              <div className={`${light.panel} ${light.panelButtons}`}>
                <span className={light.panelTitle}>Choose your button style</span>
                <div className={light.buttonStyles}>
                  <span className={light.buttonA}>Button A</span>
                  <span className={light.buttonB}>Button B</span>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
