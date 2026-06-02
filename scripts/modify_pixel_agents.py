#!/usr/bin/env python3
"""
Modify Pixel Agents extension to support Cline/DeepSeek agents.
Adds detection of Cline terminals and reads Cline session data.
"""
import os

EXTENSION_JS = os.path.expanduser(r"~\.vscode\extensions\pablodelucca.pixel-agents-1.3.0\dist\extension.js")
BACKUP_JS = EXTENSION_JS + ".backup"

def main():
    print(f"Reading {EXTENSION_JS}...")
    with open(EXTENSION_JS, 'r', encoding='utf-8') as f:
        js = f.read()
    
    original = js
    
    # CHANGE 1: Add "Cline" terminal name constant alongside "Claude Code"
    js = js.replace(
        've="Claude Code"',
        've="Claude Code",we="Cline"',
        1
    )
    print("1/4 Added 'Cline' terminal name constant")
    
    # CHANGE 2: Modify terminal name checks to also match "Cline"
    # Check 2a: Active terminal check (p.name.startsWith(ve))
    js = js.replace(
        'p.name.startsWith(ve)',
        'p.name.startsWith(ve)||p.name.startsWith(we)',
    )
    # Check 2b: Terminals loop check (!m.name.startsWith(ve))
    js = js.replace(
        '!m.name.startsWith(ve)',
        '!m.name.startsWith(ve)&&!m.name.startsWith(we)',
    )
    print("2/4 Modified terminal name checks to include Cline")
    
    # CHANGE 3: Add Cline session watcher function after bo function
    old_bo_end = '}}}function ms('
    new_bo_end = (
        '}}}\n'
        'function clineSessionWatcher(t,e,s,n,o,i,r,a,c){try{'
        'let l=v.join(ds.homedir(),".claude","sessions");'
        'if(!b.existsSync(l))return;'
        'let f=b.readdirSync(l).filter(function(h){return h.endsWith(".json")}).map(function(h){return v.join(l,h)});'
        'for(let h of f){try{'
        'let u=JSON.parse(b.readFileSync(h,"utf-8"));'
        'if(!u.sessionId||!u.cwd)continue;'
        'let p=v.join(ds.homedir(),".claude","projects");'
        'let g=u.cwd.replace(/[^a-zA-Z0-9-]/g,"-");'
        'let m=v.join(p,g);'
        'if(!b.existsSync(m)){b.mkdirSync(m,{recursive:!0})}'
        'let S=v.join(m,u.sessionId+".jsonl");'
        'if(!b.existsSync(S)){b.writeFileSync(S,"")}'
        'if(t.has(S))continue;'
        'let _=!1;'
        'for(let x of s.values()){if(x.jsonlFile===S){_=!0;break}}'
        'if(_)continue;'
        't.add(S);'
        'console.log("[Pixel Agents] Cline: detected session "+u.sessionId+" ("+g+")");'
        'ut(S,m,e,s,n,o,i,r,a,c,g)'
        '}catch{}}}catch{}}\n'
        'function ms('
    )
    
    if old_bo_end in js:
        js = js.replace(old_bo_end, new_bo_end, 1)
        print("3/4 Added Cline session watcher function")
    else:
        print("3/4 WARNING: Could not find bo function end pattern")
    
    # CHANGE 4: Call clineSessionWatcher from the main polling loop
    old_poll = 'de.add(t),!s.current&&(s.current=setInterval(()=>{if(!u?.current)for(let p of de)_o(p,e,n,o,i,r,a,c,l,f,d)},1e3))'
    new_poll = 'de.add(t),!s.current&&(s.current=setInterval(()=>{if(!u?.current)for(let p of de)_o(p,e,n,o,i,r,a,c,l,f,d);try{clineSessionWatcher(e,n,o,i,r,a,c,l,f,d)}catch(e){}},1e3))'
    
    if old_poll in js:
        js = js.replace(old_poll, new_poll, 1)
        print("4/4 Added Cline session watcher to main polling loop")
    else:
        print("4/4 WARNING: Could not find main polling loop pattern")
    
    # Write the modified file
    if js == original:
        print("\nWARNING: No changes were made! Something went wrong.")
        return
    
    # Verify syntax with Node.js
    import subprocess
    import tempfile
    with tempfile.NamedTemporaryFile(suffix='.js', delete=False, mode='w') as f:
        f.write(js)
        temp_path = f.name
    
    result = subprocess.run(['node', '--check', temp_path], capture_output=True, text=True)
    os.unlink(temp_path)
    
    if result.returncode != 0:
        print(f"\nWARNING: Syntax check FAILED: {result.stderr[:500]}")
        print("Restoring from backup...")
        with open(BACKUP_JS, 'r', encoding='utf-8') as f:
            js = f.read()
        with open(EXTENSION_JS, 'w', encoding='utf-8') as f:
            f.write(js)
        print("Restored original file.")
        return
    
    with open(EXTENSION_JS, 'w', encoding='utf-8') as f:
        f.write(js)
    
    print(f"\nSuccessfully modified {EXTENSION_JS}")
    print(f"Backup saved at {BACKUP_JS}")
    print("\nPlease reload VS Code window (Ctrl+Shift+P -> Developer: Reload Window)")
    print("Then open a Cline terminal and the Pixel Agents panel should detect it.")

if __name__ == "__main__":
    main()
